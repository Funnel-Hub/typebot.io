import { TRPCError } from '@trpc/server'
import { env } from '@typebot.io/env'
import { Socket, io } from 'socket.io-client'
import { WhatsappOperationTypes } from './WhatsappOperationType'
import { WhatsappSocketSendingMessage } from './convertMessageToWhatsappComponent'
import prisma from '@typebot.io/lib/prisma'
import axios from 'axios'
import { SessionState } from '@typebot.io/schemas'

type SendMessagePayload = {
  phones: string[]
  message: WhatsappSocketSendingMessage
  sessionId: string
  state?: SessionState
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

export async function sendSocketWhatsappMessage(
  clientId: string,
  { message, phones, sessionId, state }: SendMessagePayload
) {
  const socketClient = await new Promise<Socket>((resolve, reject) => {
    const socket = io(env.WHATSAPP_SERVER, {
      autoConnect: true,
      query: {
        clientId,
        operationType: WhatsappOperationTypes.SEND_MESSAGE,
      },
      upgrade: false,
      transports: ['websocket'],
    })

    socket.on('qr', async () => {
      socket.close()
      console.log(
        '!state?.typebotsQueue[0]?.typebot?.id >>>',
        state?.typebotsQueue[0]?.typebot?.id
      )
      if (!state?.typebotsQueue[0]?.typebot?.id) return
      const typebot = await getMembersByTypebotSession(
        state.typebotsQueue[0].typebot.id
      )
      console.log('typebot whatsapp', typebot)
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
      reject(
        new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Sessão expirada, por favor configure novamente o qr code do seu whatsapp',
        })
      )
    })

    socket.on('ready', () => {
      resolve(socket)
    })

    socket.on('error', (err) => {
      reject(new Error(JSON.stringify(err)))
    })
  })

  phones.forEach((phone) => {
    socketClient.emit('sendMessage', {
      phoneNumber: phone,
      message,
      sessionId,
    })
  })

  await new Promise((resolve) => setTimeout(resolve, 100))
  socketClient.close()
}
