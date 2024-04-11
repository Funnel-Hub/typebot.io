import { computeCurrentProgress } from '../computeCurrentProgress'
import { filterPotentiallySensitiveLogs } from '../logs/filterPotentiallySensitiveLogs'
import { restartSession } from '../queries/restartSession'
import { saveStateToDatabase } from '../saveStateToDatabase'
import { startSession } from '../startSession'
import { multipleWhatsappFlow } from '../whatsapp/WhatsappComponentFlow/multipleWhatsappFlow'

type Props = {
  origin: string | undefined
  message?: string
  isOnlyRegistering: boolean
  publicId: string
  isStreamEnabled: boolean
  prefilledVariables?: Record<string, unknown>
  resultId?: string
	isWhatsappIntegration?: boolean
}

export const startChat = async ({
  origin,
  message,
  isOnlyRegistering,
  publicId,
  isStreamEnabled,
  prefilledVariables,
  resultId: startResultId,
	isWhatsappIntegration = false,
}: Props) => {
  const {
    typebot,
    messages,
    input,
    resultId,
    dynamicTheme,
    logs,
    clientSideActions,
    newSessionState,
    visitedEdges,
  } = await startSession({
    version: 2,
    startParams: {
      type: 'live',
      isOnlyRegistering,
      isStreamEnabled,
      publicId,
      prefilledVariables,
      resultId: startResultId,
			isWhatsappIntegration,
    },
    message,
  })

  let corsOrigin

  if (
    newSessionState.allowedOrigins &&
    newSessionState.allowedOrigins.length > 0
  ) {
    if (origin && newSessionState.allowedOrigins.includes(origin))
      corsOrigin = origin
    else corsOrigin = newSessionState.allowedOrigins[0]
  }

  const session = isOnlyRegistering
    ? await restartSession({
        state: newSessionState,
      })
    : await saveStateToDatabase({
        session: {
          state: newSessionState,
        },
        input,
        logs,
        clientSideActions,
        visitedEdges,
        hasCustomEmbedBubble: messages.some(
          (message) => message.type === 'custom-embed'
        ),
      })

	// multiple whatsapp integration - funnelhub
  if (newSessionState.whatsappComponent?.canExecute) {
    await multipleWhatsappFlow({
      messages,
      sessionId: session.id,
      state: { ...newSessionState, sessionId: session.id },
      clientSideActions,
      input,
    })
    
    return {
      sessionId: session.id,
      typebot: {
        id: typebot.id,
        theme: typebot.theme,
        settings: typebot.settings,
      },
      messages: [],
      input: undefined,
      resultId,
      dynamicTheme: undefined,
      logs: [],
      clientSideActions: [],
    }
  }

  const isEnded =
    newSessionState.progressMetadata &&
    !input?.id &&
    (clientSideActions?.filter((c) => c.expectsDedicatedReply).length ?? 0) ===
      0

  return {
    sessionId: session.id,
    typebot: {
      id: typebot.id,
      theme: typebot.theme,
      settings: typebot.settings,
    },
    messages,
    input: newSessionState?.whatsappComponent?.canExecute
      ? undefined
      : input,
    resultId,
    dynamicTheme,
    logs: logs?.filter(filterPotentiallySensitiveLogs),
    clientSideActions: newSessionState?.whatsappComponent?.canExecute
      ? []
      : clientSideActions,
    corsOrigin,
    progress: newSessionState.progressMetadata
      ? isEnded
        ? 100
        : computeCurrentProgress({
            typebotsQueue: newSessionState.typebotsQueue,
            progressMetadata: newSessionState.progressMetadata,
            currentInputBlockId: input?.id,
          })
      : undefined,
  }
}
