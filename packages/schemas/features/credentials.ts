import { z } from '../zod'
import { zemanticAiCredentialsSchema } from './blocks'
import { stripeCredentialsSchema } from './blocks/inputs/payment/schema'
import { googleSheetsCredentialsSchema } from './blocks/integrations/googleSheets/schema'
import { smtpCredentialsSchema } from './blocks/integrations/sendEmail'
import { openAICredentialsSchema } from './blocks/integrations/openai'
import {
  whatsAppCredentialsSchema,
  whatsAppLiteCredentialsSchema,
  whatsappSocketCredentialsSchema,
} from './whatsapp'

export const credentialsSchema = z.discriminatedUnion('type', [
  smtpCredentialsSchema,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  openAICredentialsSchema,
  whatsAppCredentialsSchema,
  whatsAppLiteCredentialsSchema,
  whatsappSocketCredentialsSchema,
  zemanticAiCredentialsSchema,
])

export type Credentials = z.infer<typeof credentialsSchema>
