import { Stack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'

type Props = {
  credentialsId?: string
  phone?: string
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
