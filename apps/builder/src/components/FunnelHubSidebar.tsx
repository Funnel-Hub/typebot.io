import { ChakraSidebar } from '@funnelhub/sidebar'
import { useSession } from 'next-auth/react'
import { env } from '@typebot.io/env'

export const FunnelHubSidebar = ({ onClose }: { onClose?: () => void }) => {
  const { data } = useSession()

  if (!data?.user) return null

  const user = data.user as unknown as { id: string; apiToken: string }

  return (
    <ChakraSidebar
      onClose={() => {
        onClose?.()
      }}
      config={{
        url: `${env.NEXT_PUBLIC_FUNNELHUB_API_URL}/users/${user.id}/sidebar`,
        method: 'GET',
        token: user.apiToken,
      }}
      display={{ base: 'none', md: 'block' }}
    />
  )
}
