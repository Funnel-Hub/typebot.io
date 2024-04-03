import { ContinueChatResponse } from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'
import { serialize } from 'remark-slate'
import { isImageUrlNotCompatible, isVideoUrlNotCompatible } from '../convertMessageToWhatsAppMessage'

export enum TypeWhatsappMessage {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  EMBED = 'embed',
  INTERACTIVE = 'interactive'
}

export type WhatsappSocketSendingMessage = {
  type: TypeWhatsappMessage.TEXT | TypeWhatsappMessage.EMBED | TypeWhatsappMessage.IMAGE | TypeWhatsappMessage.VIDEO | TypeWhatsappMessage.AUDIO
  body: string
} | {
  type: TypeWhatsappMessage.INTERACTIVE
  interactive: Record<string, any>
}

export const convertMessageToWhatsappComponent = (
  message: ContinueChatResponse['messages'][number]
): WhatsappSocketSendingMessage | undefined => {
  switch (message.type) {
    case BubbleBlockType.TEXT: {
      if (!message.content.richText || message.content.richText.length === 0)
        return
      return {
        type: TypeWhatsappMessage.TEXT,
        body:  message.content.richText
        .map((chunk) =>
          serialize(chunk)?.replaceAll('&amp;amp;#39;', "'").replaceAll('**', '*').replaceAll('&amp;quot;', '"')
        )
        .join('\n')
      }
    }
    case BubbleBlockType.IMAGE: {
      if (!message.content.url || isImageUrlNotCompatible(message.content.url))
        return
      return {
        type: TypeWhatsappMessage.IMAGE,
        body: message.content.url,
      }
    }
    case BubbleBlockType.AUDIO: {
      if (!message.content.url) return
      return {
        type: TypeWhatsappMessage.AUDIO,
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
        type: TypeWhatsappMessage.VIDEO,
        body: message.content.url,
      }
    }
    case BubbleBlockType.EMBED: {
      if (!message.content.url) return
      return {
        type: TypeWhatsappMessage.EMBED,
        body: message.content.url,
      }
    }
    default:
      throw new Error(`Unsupported message type`)
  }
}
