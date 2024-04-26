import { SessionState } from '@typebot.io/schemas'
import { WhatsappSocketSendingMessage } from './convertMessageToWhatsappComponent'
import axios from 'axios'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'
import { TRPCError } from '@trpc/server'

type SendMessagePayload = {
  phones: string[]
  message: WhatsappSocketSendingMessage
  sessionId: string
  state?: SessionState
}

const sendNotificationToMember = async (
  member: { id: string; name: string },
  typebotName: string
) => {
  await axios.post(`${env.NEXT_PUBLIC_FUNNELHUB_URL}/api/v1/notifications`, {
    userId: member.id,
    title: 'Sessão do whatsapp expirada',
    description: `Olá ${member.name}, notamos que a sessão do whatsapp no typebot com nome ${typebotName} foi expirado, por favor, leia o qrcode novamente para evitar problemas com seu fluxo.`,
    notificationDeliveryType: ['email'],
    type: 'ALERT',
  })
}

const getMembersByTypebotSession = async (typebotId: string) => {
  const typebot = await prisma.typebot.findFirst({
    where: { id: typebotId },
    select: {
      name: true,
      workspace: {
        select: {
          members: {
            select: {
              role: true,
              user: {
                select: {
                  email: true,
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  })
  if (!typebotId) throw new Error('Typebot not found')
  return typebot
}

export const sendMessageWhatsappComponent = async (
  clientId: string,
  { message, phones, sessionId, state }: SendMessagePayload
) => {
  try {
    await axios.post(`${env.WHATSAPP_SERVER}/send-message`, {
      sessionId,
      clientId,
      phoneNumber: phones[0],
      message,
    })
  } catch (err: any) {
    if (err.response.status === 401) {
      if (!state?.typebotsQueue[0]?.typebot?.id) return
      const typebot = await getMembersByTypebotSession(
        state.typebotsQueue[0].typebot.id
      )
      if (!typebot) return
      await Promise.all(
        typebot.workspace.members.map(async (member) => {
          await sendNotificationToMember(
            {
              id: member.user.id as unknown as string,
              name: member.user.name as unknown as string,
            },
            typebot.name
          )
        })
      )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Sessão expirada, por favor configure novamente o qr code do seu whatsapp',
      })
    }
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
}
