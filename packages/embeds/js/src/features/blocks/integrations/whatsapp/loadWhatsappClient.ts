import { env } from '@typebot.io/env'

export const executeLoadWhatsappClient = async (clientId: string) => {
  await new Promise((resolve, reject) => {
    const socket = new WebSocket(
      `${env.NEXT_PUBLIC_WHATSAPP_SERVER}?clientId=${clientId}`
    )
    socket.onopen = () => console.log('Socket connected')
    socket.onmessage = (event) => {
      if (!event.data) return
      const payloadParsed = JSON.parse(event.data ?? '{}')
      if (payloadParsed.status === 'ready') {
        resolve(payloadParsed)
      }
      if (payloadParsed.status === 'auth_failure') {
        reject(
          new Error(
            'Falha na autenticação do whatsapp, leia o qr code novamente'
          )
        )
      }
    }
  })
  return { replyToSend: 'whatsappComponent' }
}
