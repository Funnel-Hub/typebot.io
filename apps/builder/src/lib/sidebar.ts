import { LinkItemProps } from '@funnelhub/sidebar'

import {
    FiHome,
    FiSettings
} from 'react-icons/fi'
import {
    FaRobot,
    FaCalendarDay,
    FaVideo,
    FaFunnelDollar,
    FaWindowRestore
} from 'react-icons/fa'
import { env } from '@typebot.io/env'

export const sidebarMenuData = [
    { name: "Início", icon: FiHome, url: env.NEXT_PUBLIC_FUNNELHUB_URL, options: {} },
    { name: "CRM", icon: FaFunnelDollar, /* url: "https://localhost:3002/", */ options: {} },
    { name: "Pages", icon: FaWindowRestore, /* url: "/#", */ options: {} },
    { name: "Typebot", icon: FaRobot, url: env.NEXT_PUBLIC_APP_URL, options: {} },
    { name: "Cal.com", icon: FaCalendarDay, /* url: "/#", */ options: {} },
    { name: "Mentoria", icon: FaVideo, /* url: "/#", */ options: {} },
    { name: "Configurações", icon: FiSettings, /* url: "/#", */ options: {} },
] as Array<LinkItemProps>
