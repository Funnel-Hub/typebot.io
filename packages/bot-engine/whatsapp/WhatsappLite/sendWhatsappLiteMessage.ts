import { whatsAppLiteCredentials } from '@typebot.io/schemas/features/whatsapp'
import { env } from '@typebot.io/env'
import axios from 'axios'
import { WhatsappLiteMessage } from './convetMessageToWhatsappLiteMessage'

type Props = {
  to: string
  message: WhatsappLiteMessage
  credentials: whatsAppLiteCredentials['data']
}

export const sendWhatsAppLiteMessage = async ({
  to,
  message,
  credentials,
}: Props) =>
  axios.post(`${env.WHATSAPP_SERVER}/send-message`, {
    clientId: credentials.sessionId,
    phoneNumber: to,
    message,
  })
