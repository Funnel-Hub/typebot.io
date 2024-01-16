import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { Stack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import {
  WhatsappBlock,
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp'

type Props = {
  credentialsId: WhatsappBlock['options']['credentialsId']
  answer: WhatsappBlock['options']['answer']
}

export const WhatsappNodeBody = ({ credentialsId, answer }: Props) => {
  const { t } = useTranslate()
  const withVariableAnswer = answer?.variableId
  return (
    <Stack>
      <Text color={credentialsId ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {credentialsId ? t('editor.blocks.integrations.whatsapp.WhatsappNodeBody.sendMessage') : `${t('editor.blocks.integrations.whatsapp.WhatsappNodeBody.configure')}...`}
      </Text>
      {withVariableAnswer && (<WithVariableContent variableId={withVariableAnswer} />)}
    </Stack>
  )
}
