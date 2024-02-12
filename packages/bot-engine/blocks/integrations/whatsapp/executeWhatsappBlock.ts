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

  return { 
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
