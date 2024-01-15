import { z } from 'zod'
import { blockBaseSchema, credentialsBaseSchema } from '../../shared'
import { IntegrationBlockType } from '../constants'

const whatsappBaseOptionsSchema = z.object({
  credentialsId: z.string().optional()
})

const whatsappOptionsSchema = z
  .object({
    message: z
      .string().optional(),
    phones: z.string().array().optional(),
  })
  .merge(whatsappBaseOptionsSchema)


export const whatsappBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.WHATSAPP]),
    options: whatsappOptionsSchema
  })
)

export const whatsappCredentialsSchema = z
  .object({
    type: z.literal('whatsapp'),
    data: z.object({
      clientId: z.string(),
      phoneNumber: z.string(),
    }),
  })
  .merge(credentialsBaseSchema)

export type WhatsappCredentials = z.infer<typeof whatsappCredentialsSchema>
export type WhatsappBlock = z.infer<typeof whatsappBlockSchema>
