import { ContinueChatResponse } from '@typebot.io/schemas'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { serialize } from 'remark-slate'


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
        body:  message.content.richText
        .map((chunk) =>
          serialize(chunk)?.replaceAll('&amp;amp;#39;', "'").replaceAll('**', '*')
        )
        .join('\n')
      }
    }
    default:
      throw new Error('Unsupported message type')
  }
}
