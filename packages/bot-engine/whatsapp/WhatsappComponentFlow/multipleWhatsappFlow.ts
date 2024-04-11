import { ContinueChatResponse, SessionState } from '@typebot.io/schemas'
import { executeWhatsappFlow } from './executeWhatsappFlow'
import { getBlockById } from '@typebot.io/lib/getBlockById'
import { continueBotFlow } from '../../continueBotFlow'
import { getSession } from '../../queries/getSession'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { saveStateToDatabase } from '../../saveStateToDatabase'

type Props = {
  state: SessionState
  sessionId: string
  message?: string
} & Pick<ContinueChatResponse, 'messages' | 'input' | 'clientSideActions'>

export async function multipleWhatsappFlow({
  state,
  messages: messagesProps,
  clientSideActions: clientSideActionsProps,
  input: inputProps,
  message,
  sessionId,
}: Props) {
  await executeWhatsappFlow({
    state,
    messages: messagesProps,
    input: inputProps,
    clientSideActions: clientSideActionsProps,
  })

  if (!state.currentBlockId) return

  let block = getBlockById(
    state.currentBlockId,
    state.typebotsQueue[0].typebot.groups
  ).block as any

  let whatsappComponents = 0
  for (const group of state.typebotsQueue[0].typebot.groups) {
    const block = group.blocks.find(
      (block) => block.type === IntegrationBlockType.WHATSAPP
    )
    if (block) whatsappComponents += 1
  }

  if (whatsappComponents === 1) return

  let currentState = state
  const blocksNotRepeat = [block.id]
  while (block?.type === IntegrationBlockType.WHATSAPP && block?.options) {
    const {
      messages,
      input,
      clientSideActions,
      newSessionState,
      visitedEdges,
      logs,
    } = await continueBotFlow(message, {
      version: 2,
      state: { ...currentState, sessionId: sessionId },
      startTime: Date.now(),
      multipleWhatsappIntegration: true,
    })

    currentState = newSessionState

    if (newSessionState)
      await saveStateToDatabase({
        session: {
          id: sessionId,
          state: newSessionState,
        },
        input,
        logs,
        clientSideActions,
        visitedEdges,
      })

    await executeWhatsappFlow({
      state: newSessionState,
      messages,
      input,
      clientSideActions,
    })

    if (!newSessionState.currentBlockId) return
    if (blocksNotRepeat.includes(newSessionState.currentBlockId)) return

    block = getBlockById(
      newSessionState.currentBlockId!,
      newSessionState.typebotsQueue[0].typebot.groups
    ).block

    blocksNotRepeat.push(block.id)
  }
}
