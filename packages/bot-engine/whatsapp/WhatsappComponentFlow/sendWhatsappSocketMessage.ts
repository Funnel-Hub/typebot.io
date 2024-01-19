import WebSocket, { ErrorEvent } from "ws"

type SendMessagePayload = {
  phones: string[]
  message: string
  sessionId?: string
}

export async function sendSocketWhatsappMessage(clientId: string, { message, phones, sessionId }: SendMessagePayload) {
  const socketClient = await new Promise<WebSocket>((resolve, reject) => {
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WHATSAPP_SERVER!}?clientId=${clientId}`)
    socket.onopen = () => {
      console.log('Connected')
    }
    socket.onerror = (event: ErrorEvent) => {
      socket.close()
      reject(new Error(event.message))
    }

    socket.onmessage = (event) => {
      if (!event.data) return

      const payload = JSON.parse(event.data as string)
      if (payload.status === 'ready') {
        resolve(socket)
      }

      if(payload.status === 'qr') {
        socket.close()
        reject(new Error('Session expired, please configure again the whatsapp credentials'))
      }
    }
  })

  phones.forEach((phone) => {
    socketClient.send(JSON.stringify({
      method: 'sendMessage',
      phoneNumber: phone,
      messageBody: message,
      sessionId
    }))
  })

  socketClient.close()
}