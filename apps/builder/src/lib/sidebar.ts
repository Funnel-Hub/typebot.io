import { LinkItemProps } from '@funnelhub/sidebar'

import { FiHome, FiSettings } from 'react-icons/fi'
import {
  FaRobot,
  FaCalendarDay,
  FaVideo,
  FaFunnelDollar,
  FaWindowRestore,
} from 'react-icons/fa'
import { env } from '@typebot.io/env'

const disabled = {
  pointerEvents: 'none',
  cursor: 'default',
  color: 'gray',
}

export const sidebarMenuData = [
  {
    name: 'Início',
    icon: FiHome,
    url: env.NEXT_PUBLIC_FUNNELHUB_URL,
    options: {},
  },
  {
    name: 'CRM',
    icon: FaFunnelDollar,
    /* url: "https://localhost:3002/", */
    options: disabled,
  },
  { name: 'Pages', icon: FaWindowRestore, /* url: "/#", */ options: disabled },
  { name: 'Typebot', icon: FaRobot, url: env.NEXT_PUBLIC_APP_URL, options: {} },
  { name: 'Cal.com', icon: FaCalendarDay, /* url: "/#", */ options: disabled },
  { name: 'Mentoria', icon: FaVideo, /* url: "/#", */ options: disabled },
  {
    name: 'Configurações',
    icon: FiSettings,
    /* url: "/#", */ options: disabled,
  },
] as Array<LinkItemProps>
