import WebSocket, { ErrorEvent } from "ws"

type SendMessagePayload = {
  phones: string[]
  message: string
}

export async function sendSocketMessage(clientId: string, { message, phones }: SendMessagePayload) {
  const socketClient = await new Promise<WebSocket>((resolve, reject) => {
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WHATSAPP_SERVER!}?clientId=${clientId}`)
    socket.onopen = () => {
      console.log('Connected')
    }
    socket.onerror = (event: ErrorEvent) => {
      reject(new Error(event.message))
    }

    socket.onmessage = (event) => {
      if (!event.data) return

      const payload = JSON.parse(event.data as string)
      if (payload.status === 'ready') {
        resolve(socket)
      }
    }
  })

  phones.forEach((phone) => {
    socketClient.send(JSON.stringify({
      method: 'sendMessage',
      phoneNumber: phone,
      messageBody: message
    }))
  })

  socketClient.close()
}