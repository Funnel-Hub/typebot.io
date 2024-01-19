import * as Sentry from '@sentry/nextjs'
import { isNotDefined } from '@typebot.io/lib/utils'
import { ContinueChatResponse, SessionState } from "@typebot.io/schemas"
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { HTTPError } from 'got'
import { continueBotFlow } from '../../continueBotFlow'
import { convertInputToWhatsAppComponent } from './convertInputToWhatsappComponent'
import { WhatsappSocketSendingMessage, convertMessageToWhatsappComponent } from './convertMessageToWhatsappCompoent'
import { sendSocketWhatsappMessage } from './sendWhatsappSocketMessage'

type Props = {
  state: SessionState
} & Pick<ContinueChatResponse, 'messages' | 'input' | 'clientSideActions'>

export async function executeWhatsappFlow({ state, messages, input, clientSideActions }: Props) {
  if(!state?.whatsappComponent?.clientId)
    throw new Error("Whatsapp component not configured")

  if(!state?.whatsappComponent?.phone)
    throw new Error("Whatsapp component phone not configured")

  const messagesBeforeInput = isLastMessageIncludedInInput(input)
    ? messages.slice(0, -1)
    : messages

  const sentMessages: WhatsappSocketSendingMessage[] = []

  const clientSideActionsBeforeMessages =
    clientSideActions?.filter((action) =>
      isNotDefined(action.lastBubbleBlockId)
    ) ?? []

  for (const action of clientSideActionsBeforeMessages) {
    const result = await executeClientSideAction(action)
    if (!result) continue
    const { input, newSessionState, messages, clientSideActions } =
      await continueBotFlow(result.replyToSend, { version: 2, state })

    return executeWhatsappFlow({
      messages,
      input,
      clientSideActions,
      state: newSessionState,
    })
  }

  for (const message of messagesBeforeInput) {
    const whatsAppMessage = convertMessageToWhatsappComponent(message)
    if (isNotDefined(whatsAppMessage)) continue
    try {
      await sendSocketWhatsappMessage(state.whatsappComponent?.clientId, {
        message: whatsAppMessage.body,
        phones: [state.whatsappComponent.phone],
        sessionId: state.sessionId,
      })
      sentMessages.push(whatsAppMessage)
      const clientSideActionsAfterMessage =
        clientSideActions?.filter(
          (action) => action.lastBubbleBlockId === message.id
        ) ?? []
      for (const action of clientSideActionsAfterMessage) {
        const result = await executeClientSideAction(
          action
        )
        if (!result) continue
        const { input, newSessionState, messages, clientSideActions } =
          await continueBotFlow(result.replyToSend, { version: 2, state })

        return executeWhatsappFlow({
          messages,
          input,
          clientSideActions,
          state: newSessionState,
        })
      }
    } catch (err) {
      console.log(err)
      Sentry.captureException(err, { extra: { message } })
      console.log('Failed to send message:', JSON.stringify(message, null, 2))
      if (err instanceof HTTPError)
        console.log('HTTPError', err.response.statusCode, err.response.body)
    }
  }

  if (input) {
    const inputWhatsAppMessages = convertInputToWhatsAppComponent(
      input
    )
    for(const message of inputWhatsAppMessages) {
      try {
        await sendSocketWhatsappMessage(state.whatsappComponent?.clientId, {
          message: message.body,
          phones: [state.whatsappComponent.phone],
          sessionId: state.sessionId,
        })
      } catch (err) {
        console.log(err)
        Sentry.captureException(err, { extra: { message } })
        console.log('Failed to send message:', JSON.stringify(message, null, 2))
        if (err instanceof HTTPError)
          console.log('HTTPError', err.response.statusCode, err.response.body)
      }
    }
  }
}

const isLastMessageIncludedInInput = (
  input: ContinueChatResponse['input']
): boolean => {
  if (isNotDefined(input)) return false
  return input.type === InputBlockType.CHOICE
}

const executeClientSideAction =
  async (
    clientSideAction: NonNullable<
      ContinueChatResponse['clientSideActions']
    >[number]
  ): Promise<{ replyToSend: string | undefined } | void> => {
    if ('wait' in clientSideAction) {
      await new Promise((resolve) =>
        setTimeout(resolve, clientSideAction.wait.secondsToWaitFor * 1000)
      )
      if (!clientSideAction.expectsDedicatedReply) return
      return {
        replyToSend: undefined,
      }
    }
    console.log('redirect' in clientSideAction && clientSideAction.redirect.url)
    console.log(clientSideAction)
    // if ('redirect' in clientSideAction && clientSideAction.redirect.url) {
    //   const message = {
    //     type: 'text',
    //     text: {
    //       body: clientSideAction.redirect.url,
    //       preview_url: true,
    //     },
    //   } satisfies WhatsAppSendingMessage
    //   try {
    //     await sendWhatsAppMessage({
    //       to: context.to,
    //       message,
    //       credentials: context.credentials,
    //     })
    //   } catch (err) {
    //     Sentry.captureException(err, { extra: { message } })
    //     console.log('Failed to send message:', JSON.stringify(message, null, 2))
    //     if (err instanceof HTTPError)
    //       console.log('HTTPError', err.response.statusCode, err.response.body)
    //   }
    // }
  }