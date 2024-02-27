import { ChakraSidebar } from '@funnelhub/sidebar'
import { env } from '@typebot.io/env'
import { useSession } from 'next-auth/react'

type sidebarConfigProps = {
  userId: string
  token: string
}

export function sidebarConfig({ token, userId }: sidebarConfigProps) {
  return {
    url: `${env.NEXT_PUBLIC_FUNNELHUB_URL}/api/v1/users/${userId}/profile`,
    token,
    method: 'GET',
  }
}

export const FunnelHubSidebar = ({ onClose }: { onClose?: () => void }) => {
  const session = useSession()

  return (
    <>
      {session?.data?.user && (
        <ChakraSidebar
          onClose={() => {
            onClose?.()
          }}
          display={{ base: 'none', md: 'block' }}
          initialCollapsedState={true}
          config={sidebarConfig({
            token: session.data.user.apiToken,
            userId: session.data.user.id,
          })}
          menuData={[]}
        />
      )}
    </>
  )
}
