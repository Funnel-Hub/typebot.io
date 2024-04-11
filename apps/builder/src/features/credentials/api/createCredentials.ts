import { isWriteWorkspaceForbidden } from '@/features/workspace/helpers/isWriteWorkspaceForbidden'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { encrypt } from '@typebot.io/lib/api/encryption/encrypt'
import prisma from '@typebot.io/lib/prisma'
import { isDefined } from '@typebot.io/lib/utils'
import {
  Credentials,
  googleSheetsCredentialsSchema,
  stripeCredentialsSchema,
  zemanticAiCredentialsSchema,
} from '@typebot.io/schemas'
import { openAICredentialsSchema } from '@typebot.io/schemas/features/blocks/integrations/openai'
import { smtpCredentialsSchema } from '@typebot.io/schemas/features/blocks/integrations/sendEmail'
import {
  whatsAppCredentialsSchema,
  whatsappSocketCredentialsSchema,
} from '@typebot.io/schemas/features/whatsapp'
import { z } from 'zod'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'

const inputShape = {
  data: true,
  type: true,
  workspaceId: true,
  name: true,
} as const

export const createCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/credentials',
      protect: true,
      summary: 'Create credentials',
      tags: ['Credentials'],
    },
  })
  .input(
    z.object({
      credentials: z
        .discriminatedUnion('type', [
          stripeCredentialsSchema.pick(inputShape),
          smtpCredentialsSchema.pick(inputShape),
          googleSheetsCredentialsSchema.pick(inputShape),
          openAICredentialsSchema.pick(inputShape),
          whatsAppCredentialsSchema.pick(inputShape),
          whatsappSocketCredentialsSchema.pick(inputShape),
          zemanticAiCredentialsSchema.pick(inputShape),
        ])
        .and(z.object({ id: z.string().cuid2().optional() })),
    })
  )
  .output(
    z.object({
      credentialsId: z.string(),
    })
  )
  .mutation(async ({ input: { credentials }, ctx: { user } }) => {
    if (await isNotAvailable(credentials.name, credentials.type))
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Credentials already exist.',
      })
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: credentials.workspaceId,
      },
      select: { id: true, members: true },
    })
    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    const { encryptedData, iv } = await encrypt(credentials.data)
    const createdCredentials = await prisma.credentials.create({
      data: {
        ...credentials,
        data: encryptedData,
        iv,
      },
      select: {
        id: true,
      },
    })
    if (credentials.type === 'whatsApp')
      await trackEvents([
        {
          workspaceId: workspace.id,
          userId: user.id,
          name: 'WhatsApp credentials created',
        },
      ])
    return { credentialsId: createdCredentials.id }
  })

const isNotAvailable = async (name: string, type: Credentials['type']) => {
  if (type !== 'whatsApp') return
  const existingCredentials = await prisma.credentials.findFirst({
    where: {
      type,
      name,
    },
  })
  return isDefined(existingCredentials)
}
