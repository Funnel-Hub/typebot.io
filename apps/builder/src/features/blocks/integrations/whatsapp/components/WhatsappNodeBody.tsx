import { Stack, Text } from '@chakra-ui/react'
import {
  WhatsappBlock,
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp'

type Props = {
  credentialsId: WhatsappBlock['options']['credentialsId']
}

export const WhatsappNodeBody = ({ credentialsId }: Props) => {

  return (
    <Stack>
      <Text color={credentialsId ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {credentialsId ? 'Send message' : 'Configure...'}
      </Text>
    </Stack>
  )
}
