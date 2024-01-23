import { ChakraSidebar } from '@funnelhub/sidebar'
import { sidebarMenuData } from '@/lib/sidebar'

export const FunnelHubSidebar = ({ onClose }: { onClose?: () => void }) => (
  <ChakraSidebar
  	onClose={() => {
      onClose?.()
  	}}
  	display={{ base: 'none', md: 'block' }}
  	menuData={sidebarMenuData}
  />
)
