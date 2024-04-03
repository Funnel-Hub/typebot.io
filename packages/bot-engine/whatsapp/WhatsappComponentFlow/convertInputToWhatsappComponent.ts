import { ContinueChatResponse } from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { TypeWhatsappMessage, WhatsappSocketSendingMessage } from './convertMessageToWhatsappComponent'

export const convertInputToWhatsAppComponent = (
  input: NonNullable<ContinueChatResponse['input']>,
): WhatsappSocketSendingMessage[] => {
  switch (input.type) {
    case InputBlockType.DATE:
    case InputBlockType.EMAIL:
    case InputBlockType.FILE:
    case InputBlockType.NUMBER:
    case InputBlockType.PHONE:
    case InputBlockType.URL:
    case InputBlockType.PAYMENT:
    case InputBlockType.RATING:
    case InputBlockType.TEXT:
      return []
    case InputBlockType.PICTURE_CHOICE:
        const items = input.items.flatMap((item, idx) => {
          let bodyText = ''
          if(item.title) bodyText += `*${item.title}*`
          if(item.description) {
            if(item.title) bodyText += `\n\n`
            bodyText += item.description
          }
          const imageMessage = item.pictureSrc
          ? ({
            type: TypeWhatsappMessage.IMAGE,
            body: item.pictureSrc ?? ''
          }) : undefined
          const textMessage = {
            type: TypeWhatsappMessage.TEXT,
            body: `${idx + 1}. ${bodyText}`
          }
          return imageMessage ? [imageMessage, textMessage] : [textMessage]
        })
        let initialMessage = '*Selecione uma opção abaixo:*\nDigite o título da opção desejada.';
        if(input.options?.isMultipleChoice) {
          initialMessage = '*Selecione uma ou mais opções abaixo:*\nDigite os títulos das opções separados por vírgula.';
        }
        items.unshift({
          type: TypeWhatsappMessage.TEXT,
          body: initialMessage
        })
        return items as WhatsappSocketSendingMessage[]
    case InputBlockType.CHOICE: {
      let initialMessage = '*Digite a opção desejada.*\n';
      if(input.options?.isMultipleChoice) {
        initialMessage = '*Digite as opções desejadas separados por vírgula.*\n';
      }
      return [
        {
          type: TypeWhatsappMessage.TEXT,
          body: initialMessage.concat(
            input.items.map((item) => `- ${item.content}`).join('\n')
          )
        }
      ]
    }
    default:
      throw new Error('Unsupported input type')
  }
}
