import { ContinueChatResponse } from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { convertRichTextToWhatsAppText } from '../convertRichTextToWhatsAppText'


export type WhatsappSocketSendingMessage = {
  type: 'text'
  body: string
}

export const convertMessageToWhatsappComponent = (
  message: ContinueChatResponse['messages'][number]
): WhatsappSocketSendingMessage | undefined => {
  switch (message.type) {
    case BubbleBlockType.TEXT: {
      if (!message.content.richText || message.content.richText.length === 0)
        return
      return {
        type: 'text',
        body: convertRichTextToWhatsAppText(message.content.richText)
      }
    }
    default:
      throw new Error('Unsupported message type')
  }
}
