import { SessionState } from '@typebot.io/schemas'
import {
  WHatsappLiteIncomingMessage,
  whatsAppLiteCredentials,
} from '@typebot.io/schemas/features/whatsapp'
import { sendChatReplyToWhatsAppLite } from './sendChatReplyToWhatsappLite'
import { getSession } from '../../queries/getSession'
import { continueBotFlow } from '../../continueBotFlow'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { saveStateToDatabase } from '../../saveStateToDatabase'
import prisma from '@typebot.io/lib/prisma'
import { isDefined } from '@typebot.io/lib/utils'
import { Reply } from '../../types'
import { startWhatsAppLiteSession } from './startWhatsappLiteSession'

type Props = {
  receivedMessage: WHatsappLiteIncomingMessage
  sessionId: string
  workspaceId?: string
  contact: NonNullable<SessionState['whatsappLite']>['contact']
  credentialsId: string
}

export const resumeWhatsAppLiteFlow = async ({
  receivedMessage,
  sessionId,
  workspaceId,
  contact,
  credentialsId,
}: Props): Promise<{ message: string }> => {
  if (receivedMessage.type !== 'text')
    return {
      message: 'invalid message type',
    }
  const messageSendDate = new Date(Number(receivedMessage.timestamp) * 1000)
  const messageSentBefore3MinutesAgo =
    messageSendDate.getTime() < Date.now() - 180000
  if (messageSentBefore3MinutesAgo) {
    console.log('Message is too old', messageSendDate.getTime())
    return {
      message: 'Message received',
    }
  }

  const credentials = await getCredentials({ credentialsId })

  if (!credentials) {
    console.error('Could not find credentials')
    return {
      message: 'Message received',
    }
  }

  const reply = await getIncomingMessageContent({
    message: receivedMessage,
  })

  const session = await getSession(sessionId)

  const isSessionExpired =
    session &&
    isDefined(session.state.expiryTimeout) &&
    session?.updatedAt.getTime() + session.state.expiryTimeout < Date.now()

  const resumeResponse =
    session && !isSessionExpired
      ? await continueBotFlow(reply, {
          version: 2,
          state: { ...session.state, whatsappLite: { contact } },
        })
      : workspaceId
      ? await startWhatsAppLiteSession({
          incomingMessage: reply,
          workspaceId,
          credentials: { ...credentials, id: credentialsId as string },
          contact,
        })
      : { error: 'workspaceId not found' }

  if ('error' in resumeResponse) {
    console.log('Chat not starting:', resumeResponse.error)
    return {
      message: 'Message received',
    }
  }

  const {
    input,
    logs,
    newSessionState,
    messages,
    clientSideActions,
    visitedEdges,
  } = resumeResponse

  const isFirstChatChunk = (!session || isSessionExpired) ?? false
  await sendChatReplyToWhatsAppLite({
    to: contact.phoneNumber,
    messages,
    input,
    isFirstChatChunk,
    typingEmulation: newSessionState.typingEmulation,
    clientSideActions,
    credentials,
    state: newSessionState,
  })

  await saveStateToDatabase({
    forceCreateSession: !session && isDefined(input),
    clientSideActions: [],
    input,
    logs,
    session: {
      id: sessionId,
      state: {
        ...newSessionState,
        currentBlockId: !input ? undefined : newSessionState.currentBlockId,
      },
    },
    visitedEdges,
  })

  return {
    message: 'Message received',
  }
}

const getIncomingMessageContent = async ({
  message,
}: {
  message: WHatsappLiteIncomingMessage
}): Promise<Reply> => {
  switch (message.type) {
    case 'text':
      return message.value
    default:
      return ''
  }
}

const getCredentials = async ({
  credentialsId,
}: {
  credentialsId?: string
}): Promise<whatsAppLiteCredentials['data'] | undefined> => {
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: credentialsId,
    },
    select: {
      data: true,
      iv: true,
    },
  })
  if (!credentials) return
  const data = (await decrypt(
    credentials.data,
    credentials.iv
  )) as whatsAppLiteCredentials['data']
  return {
    whatsappLiteBaseUrl: data.whatsappLiteBaseUrl,
    phoneNumberId: data.phoneNumberId,
  }
}
