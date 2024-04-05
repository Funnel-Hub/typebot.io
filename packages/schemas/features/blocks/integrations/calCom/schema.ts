import { z } from '../../../../zod'
import { blockBaseSchema } from '../../shared'
import { IntegrationBlockType } from '../constants'
import { calComActions, calComLayout } from './constants'

export const calComOptionsSchema = z.object({
  action: z.enum(calComActions).optional(),
  baseOrigin: z.string().url().optional(),
  eventLink: z.string().optional(),
  layout: z.enum(calComLayout).optional(),
  user: z
    .object({
	  name: z.string().optional(),
      email: z.string().optional(),
      phoneNumber: z.string().optional(),
    })
    .optional(),
  saveBookedDateInVariableId: z.string().optional(),
})

export const calComBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([IntegrationBlockType.CALCOM]),
    options: calComOptionsSchema.optional(),
  })
)

export type CalComBlock = z.infer<typeof calComBlockSchema>
