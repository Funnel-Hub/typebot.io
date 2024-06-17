import { publicProcedure } from '@/helpers/server/trpc'
import { whatsAppLiteWebhookRequestBodySchema } from '@typebot.io/schemas/features/whatsapp'
import { z } from 'zod'
import { isNotDefined } from '@typebot.io/lib'
import { resumeWhatsAppLiteFlow } from '@typebot.io/bot-engine/whatsapp/WhatsappLite/resumeWhatsappLiteFlow'

export const receiveWhatsappLiteMessage = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/workspaces/{workspaceId}/whatsapp-lite/{credentialsId}/webhook',
      summary: 'Message webhook',
      tags: ['WhatsApp'],
    },
  })
  .input(
    z
      .object({ workspaceId: z.string(), credentialsId: z.string() })
      .merge(whatsAppLiteWebhookRequestBodySchema)
  )
  .output(
    z.object({
      message: z.string(),
    })
  )
  .mutation(
    async ({
      input: { workspaceId, message, phone, myPhone, credentialsId, event },
    }) => {
      if (event !== 'new_message') return { message: 'invalid event' }
      if (isNotDefined(message)) return { message: 'No message found' }
      return resumeWhatsAppLiteFlow({
        receivedMessage: message,
        credentialsId,
        sessionId: `wa-${myPhone}-${phone}`,
        workspaceId,
        contact: {
          phoneNumber: phone,
        },
      })
    }
  )
