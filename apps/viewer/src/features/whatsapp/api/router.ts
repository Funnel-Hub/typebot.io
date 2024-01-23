import { router } from '@/helpers/server/trpc'
import { receiveMessage } from './receiveMessage'
import { receiveWhatsappComponentMessage } from './receiveWhatsappComponentMessage'
import { subscribeWebhook } from './subscribeWebhook'

export const whatsAppRouter = router({
  subscribeWebhook,
  receiveMessage,
  receiveWhatsappComponentMessage,
})
