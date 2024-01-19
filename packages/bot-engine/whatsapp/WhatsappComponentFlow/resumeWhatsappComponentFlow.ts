import { isDefined } from '@typebot.io/lib/utils';
import { continueBotFlow } from "../../continueBotFlow";
import { getSession } from "../../queries/getSession";
import { saveStateToDatabase } from '../../saveStateToDatabase';
import { executeWhatsappFlow } from "./executeWhatsappFlow";

type Props = {
  message: string
  sessionId: string
}

export async function resumeWhatsappComponentFlow({ message, sessionId }: Props) {
  const session = await getSession(sessionId);

  if(!session) {
    return {
      message: 'Session not found'
    }
  }

  const { input, messages, newSessionState, clientSideActions, logs, visitedEdges} = await continueBotFlow(message, {
    version: 2,
    state: session.state
  })

  await executeWhatsappFlow({
    input,
    messages,
    state:  newSessionState,
    clientSideActions,
  })

  await saveStateToDatabase({
    forceCreateSession: !session && isDefined(input),
    clientSideActions,
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