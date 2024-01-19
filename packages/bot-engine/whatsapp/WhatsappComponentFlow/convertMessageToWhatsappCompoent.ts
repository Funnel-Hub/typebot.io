import { ContinueChatResponse } from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'
import { serialize } from 'remark-slate'
import { isImageUrlNotCompatible, isVideoUrlNotCompatible } from '../convertMessageToWhatsAppMessage'


export type WhatsappSocketSendingMessage = {
  type: 'text' | 'image' | 'audio' | 'video' | 'embed'
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
    case BubbleBlockType.VIDEO: {
      if (
        !message.content.url ||
        (message.content.type !== VideoBubbleContentType.URL &&
          isVideoUrlNotCompatible(message.content.url))
      )
        return
      return {
        type: 'video',
        body: message.content.url,
      }
    }
    case BubbleBlockType.EMBED: {
      if (!message.content.url) return
      return {
        type: 'embed',
        body: message.content.url,
      }
    }
    default:
      throw new Error(`Unsupported message type`)
  }
}
