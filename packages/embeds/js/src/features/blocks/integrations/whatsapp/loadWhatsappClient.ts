import { env } from '@typebot.io/env'
import { io } from 'socket.io-client'

export const executeLoadWhatsappClient = async (clientId: string) => {
  await new Promise((resolve, reject) => {
    const socketIo = io(env.NEXT_PUBLIC_WHATSAPP_SERVER, {
      autoConnect: true,
      rejectUnauthorized: false,
      query: {
        clientId,
      },
    })

    socketIo.on('ready', (data) => {
      resolve(data)
    })
    socketIo.on('qr', () => {
      reject(
        new Error('Falha na autenticação do whatsapp, leia o qr code novamente')
      )
    })
    socketIo.on('auth_failure', () => {
      reject(
        new Error('Falha na autenticação do whatsapp, leia o qr code novamente')
      )
    })
  })
  return { replyToSend: 'whatsappComponent' }
}
