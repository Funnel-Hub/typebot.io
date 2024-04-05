import { TRPCError } from '@trpc/server'
import { env } from '@typebot.io/env'
import { Socket, io } from 'socket.io-client'
import { WhatsappOperationTypes } from './WhatsappOperationType'
import { WhatsappSocketSendingMessage } from './convertMessageToWhatsappComponent'
import { getSession } from '../../queries/getSession'
import prisma from '@typebot.io/lib/prisma'
import axios from 'axios'

type SendMessagePayload = {
  phones: string[]
  message: WhatsappSocketSendingMessage
  sessionId: string
}

const getMembersByTypebotSession = async (sessionId: string) => {
  const session = await getSession(sessionId)
  const typebotId = session?.state.typebotsQueue[0].typebot.id as string
  const typebots = await prisma.typebot.findMany({
    where: { OR: [{ id: typebotId }, { publicId: typebotId }] },
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
  if (!typebots[0]) throw new Error('Typebot not found')
  return typebots[0]
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
  { message, phones, sessionId }: SendMessagePayload
) {
  //const typebot = await getMembersByTypebotSession(sessionId)

  const socketClient = await new Promise<Socket>((resolve, reject) => {
    const socket = io(env.WHATSAPP_SERVER, {
      autoConnect: true,
      query: {
        clientId,
        operationType: WhatsappOperationTypes.SEND_MESSAGE,
      },
    })

    socket.on('qr', async () => {
      socket.close()
      const session = await getSession(sessionId)
      console.log(session?.state.typebotsQueue[0].typebot)
      // await Promise.all(
      //   typebot.workspace.members.map(async (member) => {
      //     await sendNotificationToMember(
      //       {
      //         id: member.user.id as unknown as string,
      //         name: member.user.name as unknown as string,
      //       },
      //       typebot.name
      //     )
      //   })
      // )
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
