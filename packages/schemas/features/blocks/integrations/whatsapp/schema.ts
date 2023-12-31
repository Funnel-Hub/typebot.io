import { z } from 'zod'
import {
  whatsappChatMessageRoles,
  whatsappChatResponseValues,
  whatsappTasks,
} from './constants'
import { variableStringSchema } from '../../../utils'
import { blockBaseSchema, credentialsBaseSchema } from '../../shared'
import { IntegrationBlockType } from '../constants'

const whatsappBaseOptionsSchema = z.object({
  credentialsId: z.string().optional(),
  baseUrl: z.string().optional(),
  apiVersion: z.string().optional(),
})

const initialOptionsSchema = z
  .object({
    task: z.undefined(),
  })
  .merge(whatsappBaseOptionsSchema)

export const nativeMessageSchema = z.object({
  id: z.string(),
  role: z.enum(whatsappChatMessageRoles).optional(),
  content: z.string().optional(),
  name: z.string().optional(),
})

const messageSequenceItemSchema = z.object({
  id: z.string(),
  role: z.literal('Messages sequence ✨'),
  content: z
    .object({
      assistantMessagesVariableId: z.string().optional(),
      userMessagesVariableId: z.string().optional(),
    })
    .optional(),
})

const dialogueItemSchema = z.object({
  id: z.string(),
  role: z.literal('Dialogue'),
  dialogueVariableId: z.string().optional(),
  startsBy: z.enum(['user', 'assistant']).optional(),
})

const whatsappChatOptionsSchema = z
  .object({
    task: z.literal(whatsappTasks[0]),
    model: z.string().optional(),
    messages: z
      .array(
        z.union([
          nativeMessageSchema,
          messageSequenceItemSchema,
          dialogueItemSchema,
        ])
      )
      .optional(),
    advancedSettings: z
      .object({
        temperature: z.number().or(variableStringSchema).optional(),
      })
      .optional(),
    responseMapping: z
      .array(
        z.object({
          id: z.string(),
          valueToExtract: z.preprocess(
            (val) => (!val ? 'Message content' : val),
            z.enum(whatsappChatResponseValues)
          ),
          variableId: z.string().optional(),
        })
      )
      .optional(),
  })
  .merge(whatsappBaseOptionsSchema)

const whatsappCreateImageOptionsSchema = z
  .object({
    task: z.literal(whatsappTasks[1]),
    prompt: z.string().optional(),
    advancedOptions: z.object({
      size: z.enum(['256x256', '512x512', '1024x1024']).optional(),
    }),
    responseMapping: z.array(
      z.object({
        id: z.string(),
        valueToExtract: z.enum(['Image URL']),
        variableId: z.string().optional(),
      })
    ),
  })
  .merge(whatsappBaseOptionsSchema)

export const whatsappBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.WHATSAPP]),
    options: z
      .discriminatedUnion('task', [
        initialOptionsSchema,
        whatsappChatOptionsSchema,
        whatsappCreateImageOptionsSchema,
      ])
      .optional(),
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
export type ChatWhatsappOptions = z.infer<typeof whatsappChatOptionsSchema>
export type CreateImageWhatsappOptions = z.infer<
  typeof whatsappCreateImageOptionsSchema
>
