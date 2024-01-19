import { ContinueChatResponse } from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { serialize } from 'remark-slate'
import { isImageUrlNotCompatible } from '../convertMessageToWhatsAppMessage'


export type WhatsappSocketSendingMessage = {
  type: 'text' | 'image' | 'audio'
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
        body:  message.content.richText
        .map((chunk) =>
          serialize(chunk)?.replaceAll('&amp;amp;#39;', "'").replaceAll('**', '*')
        )
        .join('\n')
      }
    }
    case BubbleBlockType.IMAGE: {
      if (!message.content.url || isImageUrlNotCompatible(message.content.url))
        return
      return {
        type: 'image',
        body: message.content.url,
      }
    }
    case BubbleBlockType.AUDIO: {
      if (!message.content.url) return
      return {
        type: 'audio',
        body: message.content.url,
      }
    }
    default:
      throw new Error(`Unsupported message type: ${message.type}`)
  }
}
