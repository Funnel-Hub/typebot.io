import { DropdownList } from '@/components/DropdownList'
import { TextInput } from '@/components/inputs'
import { CredentialsDropdown } from '@/features/credentials/components/CredentialsDropdown'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import {
  ChatWhatsappOptions,
  CreateImageWhatsappOptions,
  WhatsappBlock,
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp'
import {
  defaultWhatsappOptions,
  whatsappTasks,
} from '@typebot.io/schemas/features/blocks/integrations/whatsapp/constants'
import { WhatsappCredentialsModal } from './WhatsappCredentialsModal'
import { WhatsappChatSettings } from './createChat/WhatsappChatSettings'

type WhatsappTask = (typeof whatsappTasks)[number]

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

  const updateTask = (task: WhatsappTask) => {
    switch (task) {
      case 'Create chat ': {
        onOptionsChange({
          credentialsId: options?.credentialsId,
          task,
        })
        break
      }
    }
  }

  const updateBaseUrl = (baseUrl: string) => {
    onOptionsChange({
      ...options,
      baseUrl,
    })
  }

  const updateApiVersion = (apiVersion: string) => {
    onOptionsChange({
      ...options,
      apiVersion,
    })
  }

  const baseUrl = options?.baseUrl ?? defaultWhatsappOptions.baseUrl

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
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  Customize provider
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel as={Stack} spacing={4}>
                <TextInput
                  label="Base URL"
                  defaultValue={baseUrl}
                  onChange={updateBaseUrl}
                />
                {baseUrl !== defaultWhatsappOptions.baseUrl && (
                  <TextInput
                    label="API version"
                    defaultValue={options.apiVersion}
                    onChange={updateApiVersion}
                  />
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <DropdownList
            currentItem={options.task}
            items={whatsappTasks.slice(0, -1)}
            onItemSelect={updateTask}
            placeholder="Select task"
          />
          {options.task && (
            <WhatsappTaskSettings
              options={options}
              onOptionsChange={onOptionsChange}
            />
          )}
        </>
      )}
    </Stack>
  )
}

const WhatsappTaskSettings = ({
  options,
  onOptionsChange,
}: {
  options: ChatWhatsappOptions | CreateImageWhatsappOptions
  onOptionsChange: (options: WhatsappBlock['options']) => void
}) => {
  switch (options.task) {
    case 'Create chat ': {
      return (
        <WhatsappChatSettings
          options={options}
          onOptionsChange={onOptionsChange}
        />
      )
    }
    case 'Create image': {
      return null
    }
  }
}
