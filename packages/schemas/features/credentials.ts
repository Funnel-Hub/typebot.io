import { z } from 'zod'
import { zemanticAiCredentialsSchema } from './blocks'
import { stripeCredentialsSchema } from './blocks/inputs/payment/schema'
import { googleSheetsCredentialsSchema } from './blocks/integrations/googleSheets/schema'
import { openAICredentialsSchema } from './blocks/integrations/openai'
import { smtpCredentialsSchema } from './blocks/integrations/sendEmail'
import {
  whatsAppCredentialsSchema,
  whatsappSocketCredentialsSchema,
} from './whatsapp'

export const credentialsSchema = z.discriminatedUnion('type', [
  smtpCredentialsSchema,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  openAICredentialsSchema,
  whatsAppCredentialsSchema,
  whatsappSocketCredentialsSchema,
  zemanticAiCredentialsSchema,
])

export type Credentials = z.infer<typeof credentialsSchema>
