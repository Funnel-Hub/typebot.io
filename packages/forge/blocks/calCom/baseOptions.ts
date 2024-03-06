import { option } from '@typebot.io/forge'
import { defaultBaseUrl } from './constants'

export const baseOptions = option.object({
  baseUrl: option.string.layout({
    label: 'Base origin',
    placeholder: 'https://calendar.funnelhub.io',
    defaultValue: defaultBaseUrl,
    accordion: 'Customize host',
  }),
})
