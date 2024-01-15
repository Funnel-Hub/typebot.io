import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import prisma from "@typebot.io/lib/prisma";
import { ChatLog, SessionState, Variable, WhatsappBlock, WhatsappCredentials } from "@typebot.io/schemas";
import { ExecuteIntegrationResponse } from "../../../types";
import { parseVariables } from "../../../variables/parseVariables";
import { sendSocketMessage } from "./util/sendSocketMessage";

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

  if(!options.message || !options.phones) {
    return {
      outgoingEdgeId,
      logs: [
        {
          status: 'error',
          description: 'Missing message or phones',
        },
      ],
    }
  }

  const { clientId } = (await decrypt(
    credentials.data,
    credentials.iv
  )) as WhatsappCredentials['data']

  const messageWithVariables = parseVariables(allVariables)(
    options?.message
  )

  const phonesWithVariables = options.phones.map((phone) => {
    return parseVariables(allVariables)(phone)
  })

  try {
    await sendSocketMessage(clientId, {
      message: messageWithVariables,
      phones: phonesWithVariables,
    })
  } catch (e) {
    logs.push({
      status: 'error',
      description: (e as Error).message,
      details: e,
    })
  }


  return { outgoingEdgeId, logs }
}