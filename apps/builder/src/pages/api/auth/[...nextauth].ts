import NextAuth, { Account, AuthOptions } from 'next-auth'
import prisma from '@typebot.io/lib/prisma'
import { Provider } from 'next-auth/providers'
import { NextApiRequest, NextApiResponse } from 'next'
import { isDefined } from '@typebot.io/lib'
import { mockedUser } from '@typebot.io/lib/mockedUser'
import { getNewUserInvitations } from '@/features/auth/helpers/getNewUserInvitations'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis/nodejs'
import got from 'got'
import { env } from '@typebot.io/env'
import * as Sentry from '@sentry/nextjs'
import { funnelhubAdapter } from '@/features/auth/api/funnelhubAdapter'

const providers: Provider[] = []

let rateLimit: Ratelimit | undefined

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  rateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(1, '60 s'),
  })
}

export const authOptions: AuthOptions = {
  adapter: funnelhubAdapter(),
  secret: env.ENCRYPTION_SECRET,
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'None',
        path: '/',
        secure: true,
      },
    },
  },
  pages: {
    newUser: env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID ? '/onboarding' : undefined,
  },
  events: {
    signIn({ user }) {
      Sentry.setUser({ id: user.id })
    },
    signOut() {
      Sentry.setUser(null)
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token?.user) session.user = token.user
      return session
    },
    signIn: async ({ account, user }) => {
      if (!account) return false
      const isNewUser = !('createdAt' in user && isDefined(user.createdAt))
      if (isNewUser && user.email) {
        const { body } = await got.get(
          'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf'
        )
        const disposableEmailDomains = body.split('\n')
        if (disposableEmailDomains.includes(user.email.split('@')[1]))
          return false
      }
      if (env.DISABLE_SIGNUP && isNewUser && user.email) {
        const { invitations, workspaceInvitations } =
          await getNewUserInvitations(prisma, user.email)
        if (invitations.length === 0 && workspaceInvitations.length === 0)
          return false
      }
      const requiredGroups = getRequiredGroups(account.provider)
      if (requiredGroups.length > 0) {
        const userGroups = await getUserGroups(account)
        return checkHasGroups(userGroups, requiredGroups)
      }
      return true
    },
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const isMockingSession =
    req.method === 'GET' &&
    req.url === '/api/auth/session' &&
    env.NEXT_PUBLIC_E2E_TEST
  if (isMockingSession) return res.send({ user: mockedUser })
  const requestIsFromCompanyFirewall = req.method === 'HEAD'
  if (requestIsFromCompanyFirewall) return res.status(200).end()

  if (
    rateLimit &&
    req.url === '/api/auth/signin/email' &&
    req.method === 'POST'
  ) {
    let ip = req.headers['x-real-ip'] as string | undefined
    if (!ip) {
      const forwardedFor = req.headers['x-forwarded-for']
      if (Array.isArray(forwardedFor)) {
        ip = forwardedFor.at(0)
      } else {
        ip = forwardedFor?.split(',').at(0) ?? 'Unknown'
      }
    }
    const { success } = await rateLimit.limit(ip as string)
    if (!success) return res.status(429).json({ error: 'Too many requests' })
  }
  return await NextAuth(req, res, authOptions)
}

const getUserGroups = async (account: Account): Promise<string[]> => {
  switch (account.provider) {
    case 'gitlab': {
      const getGitlabGroups = async (
        accessToken: string,
        page = 1
      ): Promise<{ full_path: string }[]> => {
        const res = await fetch(
          `${
            env.GITLAB_BASE_URL || 'https://gitlab.com'
          }/api/v4/groups?per_page=100&page=${page}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const groups: { full_path: string }[] = await res.json()
        const nextPage = parseInt(res.headers.get('X-Next-Page') || '')
        if (nextPage)
          groups.push(...(await getGitlabGroups(accessToken, nextPage)))
        return groups
      }
      const groups = await getGitlabGroups(account.access_token as string)
      return groups.map((group) => group.full_path)
    }
    default:
      return []
  }
}

const getRequiredGroups = (provider: string): string[] => {
  switch (provider) {
    case 'gitlab':
      return env.GITLAB_REQUIRED_GROUPS ?? []
    default:
      return []
  }
}

const checkHasGroups = (userGroups: string[], requiredGroups: string[]) =>
  userGroups?.some((userGroup) => requiredGroups?.includes(userGroup))

export default handler
