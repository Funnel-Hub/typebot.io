import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import prisma from "@typebot.io/lib/prisma";
import { ChatLog, SessionState, WhatsappBlock, WhatsappCredentials } from "@typebot.io/schemas";
import { ExecuteIntegrationResponse } from "../../../types";
import { sendSocketMessage } from "./util/sendSocketMessage";

export const executeWhatsappBlock = async (
  _state: SessionState,
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

  try {
    await sendSocketMessage(clientId, {
      message: options.message!,
      phones: options.phones!,
    })
  } catch (e) {
    logs.push({
      status: 'error',
      description: 'Failed to send message',
      details: e,
    })
  }


  return { outgoingEdgeId, logs }
}