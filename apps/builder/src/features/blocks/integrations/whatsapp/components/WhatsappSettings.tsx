import { TextInput } from '@/components/inputs'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import {
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
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
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateCredentialsId = (credentialsId: string | undefined) => {
    onOptionsChange({
      ...options,
      credentialsId,
    })
  }

  const handlePhoneNumbersChange = (phone: string) => {
    if (!phone) return
    onOptionsChange({
      ...options,
      phone: phone.trim(),
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
            credentialsName={t('editor.blocks.integrations.whatsapp.WhatsappSettings.CredentialsDropdown.credentialsName')}
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
            label={t('editor.blocks.integrations.whatsapp.WhatsappSettings.inputPhone.label')}
            onChange={handlePhoneNumbersChange}
            defaultValue={options?.phone}
            placeholder="55888888888"
            isRequired
          />
        </>
      )}
    </Stack>
  )
}
