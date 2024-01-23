import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { extractBearerToken } from '@/lib/trpc'
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { env } from '@typebot.io/env'

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const bearerToken = extractBearerToken(opts.req)

  if (bearerToken && bearerToken === env.WORKSPACE_TOKEN) {
    return {
      user: opts.req.body,
      req: opts.req,
    }
  }

  const user = await getAuthenticatedUser(opts.req, opts.res)

  return {
    user,
    req: opts.req,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
