import { IntegrationBlock, SessionState } from '@typebot.io/schemas'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { executeChatwootBlock } from './blocks/integrations/chatwoot/executeChatwootBlock'
import { executeGoogleAnalyticsBlock } from './blocks/integrations/legacy/googleAnalytics/executeGoogleAnalyticsBlock'
import { executeGoogleSheetBlock } from './blocks/integrations/googleSheets/executeGoogleSheetBlock'
import { executePixelBlock } from './blocks/integrations/pixel/executePixelBlock'
import { executeSendEmailBlock } from './blocks/integrations/sendEmail/executeSendEmailBlock'
import { executeZemanticAiBlock } from './blocks/integrations/zemanticAi/executeZemanticAiBlock'
import { ExecuteIntegrationResponse } from './types'
import { executeOpenAIBlock } from './blocks/integrations/legacy/openai/executeOpenAIBlock'
import { executeForgedBlock } from './forge/executeForgedBlock'
import { executeWebhookBlock } from './blocks/integrations/webhook/executeWebhookBlock'
import { executeWhatsappBlock } from './blocks/integrations/whatsapp/executeWhatsappBlock'
import { isNotDefined } from '@typebot.io/lib'
import { env } from '@typebot.io/env'

export const executeIntegration =
  (state: SessionState) =>
  async (block: IntegrationBlock): Promise<ExecuteIntegrationResponse> => {
    switch (block.type) {
      case IntegrationBlockType.GOOGLE_SHEETS:
        return {
          ...(await executeGoogleSheetBlock(state, block)),
          startTimeShouldBeUpdated: true,
        }
      case IntegrationBlockType.CHATWOOT:
        return executeChatwootBlock(state, block)
      case IntegrationBlockType.GOOGLE_ANALYTICS:
        return executeGoogleAnalyticsBlock(state, block)
      case IntegrationBlockType.EMAIL:
        return executeSendEmailBlock(state, block)
      case IntegrationBlockType.WHATSAPP:
        return executeWhatsappBlock(state, block)
      case IntegrationBlockType.WEBHOOK:
      case IntegrationBlockType.ZAPIER:
      case IntegrationBlockType.MAKE_COM:
      case IntegrationBlockType.PABBLY_CONNECT:
        return {
          ...(await executeWebhookBlock(state, block, {
            disableRequestTimeout: true,
          })),
          startTimeShouldBeUpdated: true,
        }
      case IntegrationBlockType.WEBHOOK:
        return {
          ...(await executeWebhookBlock(state, block, {
            disableRequestTimeout: isNotDefined(env.CHAT_API_TIMEOUT),
          })),
        }
      case IntegrationBlockType.OPEN_AI:
        return {
          ...(await executeOpenAIBlock(state, block)),
          startTimeShouldBeUpdated: true,
        }
      case IntegrationBlockType.PIXEL:
        return executePixelBlock(state, block)
      case IntegrationBlockType.ZEMANTIC_AI:
        return {
          ...(await executeZemanticAiBlock(state, block)),
          startTimeShouldBeUpdated: true,
        }
      default:
        return {
          ...(await executeForgedBlock(state, block)),
          startTimeShouldBeUpdated: true,
        }
    }
  }
