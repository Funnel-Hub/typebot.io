import { GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from './api/auth/[...nextauth]'
import { env } from '@typebot.io/env'

export default function Page() {
  return null
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerSession(
    context.req,
    context.res,
    getAuthOptions({})
  )
  if (!session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: env.NEXT_PUBLIC_FUNNELHUB_URL
      },
    }
  }
  return {
    redirect: {
      permanent: false,
      destination:
        context.locale !== context.defaultLocale
          ? `/${context.locale}/typebots`
          : '/typebots',
    },
  }
}
