import { Stack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import {
  WhatsappBlock,
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp'

type Props = {
  credentialsId: WhatsappBlock['options']['credentialsId']
}

export const WhatsappNodeBody = ({ credentialsId }: Props) => {
  const { t } = useTranslate()
  return (
    <Stack>
      <Text color={credentialsId ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {credentialsId ? t('editor.blocks.integrations.whatsapp.WhatsappNodeBody.sendMessage') : `${t('editor.blocks.integrations.whatsapp.WhatsappNodeBody.configure')}...`}
      </Text>
    </Stack>
  )
}
