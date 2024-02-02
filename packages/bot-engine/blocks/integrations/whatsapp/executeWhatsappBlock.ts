import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import prisma from "@typebot.io/lib/prisma";
import { ChatLog, SessionState, Variable, WhatsappBlock, WhatsappCredentials } from "@typebot.io/schemas";
import { parseVariables } from '@typebot.io/variables/parseVariables';
import { ExecuteIntegrationResponse } from "../../../types";

export const executeWhatsappBlock = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
    id: blockId
  }: WhatsappBlock
): Promise<ExecuteIntegrationResponse> => {
  const noCredentialsError = {
    status: 'error',
    description: 'Missing whatsapp credentials',
  }

  if(!options?.phone) {
    return {
      outgoingEdgeId,
      logs: [
        {
          status: 'error',
          description: 'Missing phone',
        },
      ],
    }
  }

  const logs: ChatLog[] = []

  const allVariables = state.typebotsQueue.reduce<Variable[]>(
    (allVariables, typebot) => [...allVariables, ...typebot.typebot.variables],
    []
  )

  const phoneWithVariable = parseVariables(allVariables)(options.phone)

  if (!options.credentialsId) {
    return {
      outgoingEdgeId,
      logs: [noCredentialsError],
    }
  }

  const credentials = await prisma.credentials.findUnique({
    where: {
      id: options.credentialsId,
    },
  })

  if (!credentials) {
    console.error('Could not find credentials in database')
    return { outgoingEdgeId, logs: [noCredentialsError] }
  }

  const { clientId } = (await decrypt(
    credentials.data,
    credentials.iv
  )) as WhatsappCredentials['data']

  const firstEdgeId = getFirstEdgeId({
    state
  })

  const firstEdge = state.typebotsQueue[0].typebot.edges.find(edge => firstEdgeId === edge.id)
  return firstEdge?.to?.blockId === blockId ? { 
    outgoingEdgeId, 
    logs, 
    newSessionState: { 
      ...state, whatsappComponent: { 
        phone: phoneWithVariable, 
        clientId, 
        canExecute: true 
      }
    } 
  }  : { 
    outgoingEdgeId, 
    logs, 
    newSessionState: { 
      ...state, 
      whatsappComponent: { 
        phone: phoneWithVariable, 
        clientId, 
        canExecute: false 
      }
    }, 
    clientSideActions: [
      { 
        type: 'whatsappComponent', 
        whatsappComponent: { clientId }, 
        expectsDedicatedReply: true 
      }
    ] 
  } 
}

const getFirstEdgeId = ({
  state,
}: {
  state: SessionState
}) => {
  const { typebot } = state.typebotsQueue[0]
  if (typebot.version === '6') return typebot.events[0].outgoingEdgeId
  return typebot.groups[0].blocks[0].outgoingEdgeId
}
