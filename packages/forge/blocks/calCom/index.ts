import { createBlock } from '@typebot.io/forge'
import { CalComLogo } from './logo'
import { bookEvent } from './actions/bookEvent'
import { baseOptions } from './baseOptions'

export const calCom = createBlock({
  id: 'cal-com',
  name: 'Calendário',
  tags: ['calendar', 'scheduling', 'meetings'],
  LightLogo: CalComLogo,
  options: baseOptions,
  actions: [bookEvent],
})
