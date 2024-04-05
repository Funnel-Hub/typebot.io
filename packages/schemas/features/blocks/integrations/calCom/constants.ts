import { CalComBlock } from './schema'

export const calComActions = ['Book Event'] as const

export const calComLayout = ['Month', 'Weekly', 'Columns'] as const

export const defaultCalComOptions = {
  action: calComActions[0],
  baseOrigin: 'https://calendar.funnelhub.io',
  layout: calComLayout[0]
} as const satisfies CalComBlock['options']

