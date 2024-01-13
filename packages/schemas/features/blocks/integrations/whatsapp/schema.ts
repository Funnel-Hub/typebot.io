import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../../shared'
import { IntegrationBlockType } from '../constants'
import {
  whatsappChatMessageRoles
} from './constants'

const whatsappBaseOptionsSchema = z.object({
  credentialsId: z.string().optional()
})

export const nativeMessageSchema = z.object({
  id: z.string(),
  role: z.enum(whatsappChatMessageRoles).optional(),
  content: z.string().optional(),
  name: z.string().optional(),
})


const whatsappChatOptionsSchema = z
  .object({
    message: z
      .string().optional(),
    phones: z.string().array().optional(),
  })
  .merge(whatsappBaseOptionsSchema)


export const whatsappBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.WHATSAPP]),
    options: whatsappChatOptionsSchema
  })
)

export const whatsappCredentialsSchema = z
  .object({
    type: z.literal('openai'),
    data: z.object({
      apiKey: z.string(),
    }),
  })
  .merge(credentialsBaseSchema)

export type WhatsappCredentials = z.infer<typeof whatsappCredentialsSchema>
export type WhatsappBlock = z.infer<typeof whatsappBlockSchema>
