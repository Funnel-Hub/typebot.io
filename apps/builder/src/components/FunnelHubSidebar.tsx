import { ChakraSidebar } from '@funnelhub/sidebar'
import { env } from '@typebot.io/env'
import { useSession } from 'next-auth/react'

type sidebarConfigProps = {
  userId: string
  token: string
  workspaceId: string
}

export function sidebarConfig({
  token,
  userId,
  workspaceId,
}: sidebarConfigProps) {
  return {
    url: `${env.NEXT_PUBLIC_FUNNELHUB_URL}/api/v1/users/${userId}/workspaces/${workspaceId}/profile`,
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
            workspaceId: session.data.user.currentWorkspace.id,
          })}
          menuData={[]}
        />
      )}
    </>
  )
}
