import { router } from '@/helpers/server/trpc'
import { receiveMessage } from './receiveMessage'
import { receiveWhatsappComponentMessage } from './receiveWhatsappComponentMessage'
import { subscribeWebhook } from './subscribeWebhook'
import { receiveWhatsappLiteMessage } from './receiveMessageLite'

export const whatsAppRouter = router({
  subscribeWebhook,
  receiveMessage,
  receiveWhatsappComponentMessage,
  receiveWhatsappLiteMessage,
})
