import { env } from '@typebot.io/env'
import { Socket, io } from 'socket.io-client'
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
        clientId
      }
    })

    socket.on('qr', () => {
      socket.close()
      reject(new Error('Session expired, please configure again the whatsapp credentials'))
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

  socketClient.close()
}