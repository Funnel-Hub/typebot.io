import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import prisma from "@typebot.io/lib/prisma";
import { ChatLog, SessionState, Variable, WhatsappBlock, WhatsappCredentials } from "@typebot.io/schemas";
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

  const logs: ChatLog[] = []

  const allVariables = state.typebotsQueue.reduce<Variable[]>(
    (allVariables, typebot) => [...allVariables, ...typebot.typebot.variables],
    []
  )

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

  if(!options.phones) {
    return {
      outgoingEdgeId,
      logs: [
        {
          status: 'error',
          description: 'Missing phones',
        },
      ],
    }
  }

  const { clientId } = (await decrypt(
    credentials.data,
    credentials.iv
  )) as WhatsappCredentials['data']

  return { outgoingEdgeId, logs, newSessionState: { ...state, whatsappComponent: { phone: options.phones[0]!, clientId }} }
}