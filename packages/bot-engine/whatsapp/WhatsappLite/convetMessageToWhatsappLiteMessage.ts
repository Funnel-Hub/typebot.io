import { ContinueChatResponse } from '@typebot.io/schemas'
import { isSvgSrc } from '@typebot.io/lib/utils'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'
import { serialize } from 'remark-slate'

export enum TypeWhatsappMessage {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  EMBED = 'embed',
  INTERACTIVE = 'interactive',
}

export type WhatsappLiteMessage =
  | {
      type:
        | TypeWhatsappMessage.TEXT
        | TypeWhatsappMessage.EMBED
        | TypeWhatsappMessage.IMAGE
        | TypeWhatsappMessage.VIDEO
        | TypeWhatsappMessage.AUDIO
      value: string
    }
  | {
      type: TypeWhatsappMessage.INTERACTIVE
      interactive: Record<string, any>
    }

export const convertMessageToWhatsAppLiteMessage = (
  message: ContinueChatResponse['messages'][number]
): WhatsappLiteMessage | undefined => {
  switch (message.type) {
    case BubbleBlockType.TEXT: {
      if (!message.content.richText || message.content.richText.length === 0)
        return
      return {
        type: TypeWhatsappMessage.TEXT,
        value: message.content.richText
          .map((chunk) =>
            serialize(chunk)
              ?.replaceAll('&amp;amp;#39;', "'")
              .replaceAll('**', '*')
              .replaceAll('&amp;quot;', '"')
              .replaceAll('&amp;amp;quot;', '"')
          )
          .join('\n'),
      }
    }
    case BubbleBlockType.IMAGE: {
      if (!message.content.url || isImageUrlNotCompatible(message.content.url))
        return
      return {
        type: TypeWhatsappMessage.IMAGE,
        value: message.content.url,
      }
    }
    case BubbleBlockType.AUDIO: {
      if (!message.content.url) return
      return {
        type: TypeWhatsappMessage.AUDIO,
        value: message.content.url,
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
        value: message.content.url,
      }
    }
    case BubbleBlockType.EMBED: {
      if (!message.content.url) return
      return {
        type: TypeWhatsappMessage.TEXT,
        value: message.content.url,
      }
    }
  }
}

export const isImageUrlNotCompatible = (url: string) =>
  !isHttpUrl(url) || isGifFileUrl(url) || isSvgSrc(url)

export const isHttpUrl = (text: string) =>
  text.startsWith('http://') || text.startsWith('https://')

export const isGifFileUrl = (url: string) => {
  const urlWithoutQueryParams = url.split('?')[0]
  return urlWithoutQueryParams.endsWith('.gif')
}

const mp4HttpsUrlRegex = /^https:\/\/.*\.mp4$/
const isVideoUrlNotCompatible = (url: string) => !mp4HttpsUrlRegex.test(url)
