export const whatsappTasks = ['Create chat ', 'Create image'] as const

export const whatsappChatMessageRoles = ['system', 'user', 'assistant'] as const

export const whatsappChatMessageCustomRoles = [
  'Messages sequence ✨',
  'Dialogue',
] as const

export const whatsappChatResponseValues = [
  'Message content',
  'Total tokens',
] as const

export const defaultWhatsappOptions = {
  baseUrl: 'https://api.openai.com/v1',
  task: 'Create chat ',
  model: 'gpt-3.5-turbo',
} as const

export const defaultWhatsappResponseMappingItem = {
  valueToExtract: 'Message content',
} as const
