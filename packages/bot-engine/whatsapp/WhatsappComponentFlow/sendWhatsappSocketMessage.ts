import { TRPCError } from '@trpc/server'
import { env } from '@typebot.io/env'
import { Socket, io } from 'socket.io-client'
import { WhatsappOperationTypes } from './WhatsappOperationType'
import { WhatsappSocketSendingMessage } from "./convertMessageToWhatsappCompoent"

type SendMessagePayload = {
  phones: string[]
  message: WhatsappSocketSendingMessage
  sessionId?: string
}

export async function sendSocketWhatsappMessage(clientId: string, { message, phones, sessionId }: SendMessagePayload) {
  const socketClient = await new Promise<Socket>((resolve, reject) => {
    const socket = io(env.WHATSAPP_SERVER, {
      autoConnect: true,
      query: {
        clientId,
        operationType: WhatsappOperationTypes.SEND_MESSAGE
      }
    })

    socket.on('qr', () => {
      socket.close()
      reject(new TRPCError({ code: 'BAD_REQUEST', message: 'Sessão expirada, por favor configure novamente o qr code do seu whatsapp'}))
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
      sessionId
    })
  })

  await new Promise((resolve) => setTimeout(resolve, 100))
  socketClient.close()
}