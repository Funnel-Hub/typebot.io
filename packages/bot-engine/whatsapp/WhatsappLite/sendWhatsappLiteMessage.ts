import { whatsAppLiteCredentials } from '@typebot.io/schemas/features/whatsapp'
import { env } from '@typebot.io/env'
import ky from 'ky'
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
  ky.post(`https://${credentials.whatsappLiteBaseUrl}/send-messages`, {
    headers: {
      authorization: env.WHATSAPP_CLIENT_VERIFICATION_TOKEN,
    },
    json: {
      phoneNumber: to,
      messages: [message],
    },
  })
