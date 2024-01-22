import { z } from '../../../zod'
import { chatwootBlockSchema } from './chatwoot'
import { googleAnalyticsBlockSchema } from './googleAnalytics'
import { googleSheetsBlockSchemas } from './googleSheets'
import { makeComBlockSchemas } from './makeCom'
import { openAIBlockSchema } from './openai'
import { pabblyConnectBlockSchemas } from './pabblyConnect'
import { pixelBlockSchema } from './pixel/schema'
import { sendEmailBlockSchema } from './sendEmail'
import { webhookBlockSchemas } from './webhook'
import { whatsappBlockSchema } from './whatsapp'
import { zapierBlockSchemas } from './zapier'
import { zemanticAiBlockSchema } from './zemanticAi'

export const integrationBlockSchemas = {
  v5: [
    chatwootBlockSchema,
    googleAnalyticsBlockSchema,
    googleSheetsBlockSchemas.v5,
    makeComBlockSchemas.v5,
    openAIBlockSchema,
    whatsappBlockSchema,
    pabblyConnectBlockSchemas.v5,
    sendEmailBlockSchema,
    webhookBlockSchemas.v5,
    zapierBlockSchemas.v5,
    pixelBlockSchema,
    zemanticAiBlockSchema,
  ],
  v6: [
    chatwootBlockSchema,
    googleAnalyticsBlockSchema,
    googleSheetsBlockSchemas.v6,
    makeComBlockSchemas.v6,
    openAIBlockSchema,
    whatsappBlockSchema,
    pabblyConnectBlockSchemas.v6,
    sendEmailBlockSchema,
    webhookBlockSchemas.v6,
    zapierBlockSchemas.v6,
    pixelBlockSchema,
    zemanticAiBlockSchema,
  ],
} as const

const integrationBlockV5Schema = z.discriminatedUnion('type', [
  ...integrationBlockSchemas.v5,
])

const integrationBlockV6Schema = z.discriminatedUnion('type', [
  ...integrationBlockSchemas.v6,
])

const integrationBlockSchema = z.union([
  integrationBlockV5Schema,
  integrationBlockV6Schema,
])

export type IntegrationBlock = z.infer<typeof integrationBlockSchema>
export type IntegrationBlockV5 = z.infer<typeof integrationBlockV5Schema>
export type IntegrationBlockV6 = z.infer<typeof integrationBlockV6Schema>
