import { Stack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import {
  WhatsappBlock,
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp'

type Props = {
  credentialsId: WhatsappBlock['options']['credentialsId']
  phone: WhatsappBlock['options']['phone']
}

export const WhatsappNodeBody = ({ credentialsId, phone }: Props) => {
  const { t } = useTranslate()
  return (
    <Stack>
      <Text color={credentialsId && phone ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {credentialsId && phone ? t('editor.blocks.integrations.whatsapp.WhatsappNodeBody.wppIntegration') : `${t('editor.blocks.integrations.whatsapp.WhatsappNodeBody.configure')}...`}
      </Text>
    </Stack>
  )
}
