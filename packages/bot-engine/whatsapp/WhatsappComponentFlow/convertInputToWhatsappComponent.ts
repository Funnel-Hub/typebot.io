import { ContinueChatResponse } from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { WhatsappSocketSendingMessage } from './convertMessageToWhatsappCompoent'

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
    default:
      throw new Error('Unsupported input type')
  }
}
