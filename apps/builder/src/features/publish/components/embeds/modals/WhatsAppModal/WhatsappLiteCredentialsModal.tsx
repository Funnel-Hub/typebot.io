import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalHeader,
  HStack,
  Heading,
} from '@chakra-ui/react'
import React from 'react'
import { QrCodeWhatsappLite } from './QrCodeWhatsappLite'
import { createId } from '@paralleldrive/cuid2'

type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

const credentialsId = createId()

export const WhatsappLiteCredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  const { workspace } = useWorkspace()
  const { showToast } = useToast()

  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext()

  const { mutate } = trpc.credentials.createCredentials.useMutation({
    onError: (err) => {
      showToast({
        description: err.message,
        status: 'error',
      })
    },
    onSuccess: () => {
      refetchCredentials()
      onNewCredentials(credentialsId)
      onClose()
    },
  })

  const onSuccessSession = async (sessionId: string, phoneNumberId: string) => {
    if (!workspace) return
    mutate({
      credentials: {
        id: credentialsId,
        type: 'whatsappLite',
        workspaceId: workspace.id,
        name: phoneNumberId,
        data: {
          phoneNumberId,
          sessionId
        },
      },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack h="40px">
            <Heading size="md">Conecte-se com o whatsapp lite!</Heading>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="10">
          {workspace && (
            <QrCodeWhatsappLite
              workspaceId={workspace.id}
              isOpenModal={isOpen}
              onSucess={onSuccessSession}
              credentialId={credentialsId}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
