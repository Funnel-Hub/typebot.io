import { publicProcedure } from '@/helpers/server/trpc'
import { filterPotentiallySensitiveLogs } from '@typebot.io/bot-engine/logs/filterPotentiallySensitiveLogs'
import { restartSession } from '@typebot.io/bot-engine/queries/restartSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { startSession } from '@typebot.io/bot-engine/startSession'
import { multipleWhatsappFlow } from '@typebot.io/bot-engine/whatsapp/WhatsappComponentFlow/multipleWhatsappFlow'
import {
  startChatInputSchema,
  startChatResponseSchema,
} from '@typebot.io/schemas/features/chat/schema'

export const startChat = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{publicId}/startChat',
      summary: 'Start chat',
    },
  })
  .input(startChatInputSchema)
  .output(startChatResponseSchema)
  .mutation(
    async ({
      input: {
        message,
        isOnlyRegistering,
        publicId,
        isStreamEnabled,
        prefilledVariables,
        resultId: startResultId,
      },
      ctx: { origin, res },
    }) => {
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
        },
        message,
      })

      if (
        newSessionState.allowedOrigins &&
        newSessionState.allowedOrigins.length > 0
      ) {
        if (origin && newSessionState.allowedOrigins.includes(origin))
          res.setHeader('Access-Control-Allow-Origin', origin)
        else
          res.setHeader(
            'Access-Control-Allow-Origin',
            newSessionState.allowedOrigins[0]
          )
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
          })

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
      }
    }
  )
