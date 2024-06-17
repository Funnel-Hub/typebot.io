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
import { env } from '@typebot.io/env'


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
    onSuccess: (data) => {
      refetchCredentials()
      onNewCredentials(data.credentialsId)
      onClose()
    },
  })

  const onSuccessSession = async (sessionId: string, phoneNumberId: string) => {
    if (!workspace) return
    const response = await fetch(`${env.NEXT_PUBLIC_WHATSAPP_ORCHESTRATOR_URL}/sessions/load-client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        notifyMessagesWebhook: `https://typebot.funnelhub.io/api/v1/workspaces/${workspace.id}/whatsapp-lite/${credentialsId}/webhook`
      })
    })



    if (response.status !== 201) return

    await new Promise((resolve) => setTimeout(resolve, 5000));
    const clientResponse = await fetch(`${env.NEXT_PUBLIC_WHATSAPP_ORCHESTRATOR_URL}/sessions/${sessionId}/client-dns`, {
      method: 'GET'
    });

    if (clientResponse.status !== 200) return

    const clientData = await clientResponse.json()
    const clientUrl = clientData.whatsapp_client_url as string
    mutate({
      credentials: {
        id: credentialsId,
        type: 'whatsappLite',
        workspaceId: workspace.id,
        name: phoneNumberId,
        data: {
          phoneNumberId,
          whatsappLiteBaseUrl: clientUrl
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
          {workspace && <QrCodeWhatsappLite workspaceId={workspace.id} isOpenModal={isOpen} onSucess={onSuccessSession} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

