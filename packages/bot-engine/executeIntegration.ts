import { IntegrationBlock, SessionState } from '@typebot.io/schemas'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { executeChatwootBlock } from './blocks/integrations/chatwoot/executeChatwootBlock'
import { executeGoogleAnalyticsBlock } from './blocks/integrations/googleAnalytics/executeGoogleAnalyticsBlock'
import { executeGoogleSheetBlock } from './blocks/integrations/googleSheets/executeGoogleSheetBlock'
import { executeOpenAIBlock } from './blocks/integrations/openai/executeOpenAIBlock'
import { executePixelBlock } from './blocks/integrations/pixel/executePixelBlock'
import { executeSendEmailBlock } from './blocks/integrations/sendEmail/executeSendEmailBlock'
import { executeWebhookBlock } from './blocks/integrations/webhook/executeWebhookBlock'
import { executeWhatsappBlock } from './blocks/integrations/whatsapp/executeWhatsappBlock'
import { executeZemanticAiBlock } from './blocks/integrations/zemanticAi/executeZemanticAiBlock'
import { ExecuteIntegrationResponse } from './types'

export const executeIntegration =
  (state: SessionState) =>
  async (block: IntegrationBlock): Promise<ExecuteIntegrationResponse> => {
    switch (block.type) {
      case IntegrationBlockType.GOOGLE_SHEETS:
        return executeGoogleSheetBlock(state, block)
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
        return executeWebhookBlock(state, block)
      case IntegrationBlockType.OPEN_AI:
        return executeOpenAIBlock(state, block)
      case IntegrationBlockType.PIXEL:
        return executePixelBlock(state, block)
      case IntegrationBlockType.ZEMANTIC_AI:
        return executeZemanticAiBlock(state, block)
    }
  }
