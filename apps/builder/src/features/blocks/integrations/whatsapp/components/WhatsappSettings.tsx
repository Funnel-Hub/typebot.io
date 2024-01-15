import { TextInput, Textarea } from '@/components/inputs'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import {
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import { isNotEmpty } from '@typebot.io/lib'
import {
  WhatsappBlock
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp'
import { WhatsappCredentialsModal } from './WhatsappCredentialsModal'

type Props = {
  block: WhatsappBlock
  onOptionsChange: (options: WhatsappBlock['options']) => void
}

export const WhatsappSettings = ({
  block: { options },
  onOptionsChange,
}: Props) => {
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateCredentialsId = (credentialsId: string | undefined) => {
    onOptionsChange({
      ...options,
      credentialsId,
    })
  }

  const handlePhoneNumbersChange = (phones: string) => {
    const phonesArray: string[] = phones
      .split(',')
      .map((str) => str.trim())
      .filter(isNotEmpty)
    onOptionsChange({
      ...options,
      phones: phonesArray,
    })
  }

  const handleMessageChange = (message: string) => {
    onOptionsChange({
      ...options,
      message
    })
  }

  return (
    <Stack>
      {workspace && (
        <>
          <CredentialsDropdown
            type="whatsAppSocket"
            workspaceId={workspace.id}
            currentCredentialsId={options?.credentialsId ?? undefined}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={onOpen}
            credentialsName="Whatsapp account"
          />
          <WhatsappCredentialsModal
            isOpen={isOpen}
            onClose={onClose}
            onNewCredentials={updateCredentialsId}
          />
        </>
      )}
      {options?.credentialsId && (
        <>
          <TextInput
            label="Phones"
            onChange={handlePhoneNumbersChange}
            defaultValue={options?.phones?.join(', ')}
            placeholder="5555555, 5555555"
          />
          <Textarea
            label="Message"
            onChange={handleMessageChange}
            defaultValue={options?.message}
            placeholder='Hello, how are you?'
          />
        </>
      )}
    </Stack>
  )
}
