import { whatsAppLiteCredentials } from '@typebot.io/schemas/features/whatsapp'
import { env } from '@typebot.io/env'
import axios from 'axios'
import { Agent } from 'https'
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
  axios.post(
    `https://${credentials.whatsappLiteBaseUrl}/send-messages`,
    {
      phoneNumber: to,
      messages: [message],
    },
    {
      headers: {
        authorization: env.WHATSAPP_CLIENT_VERIFICATION_TOKEN,
      },
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    }
  )
