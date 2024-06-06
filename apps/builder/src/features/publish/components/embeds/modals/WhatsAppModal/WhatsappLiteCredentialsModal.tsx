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
  useSteps,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  Box,
  StepTitle,
  StepSeparator,
  HStack,
  IconButton,
  Heading,
} from '@chakra-ui/react'
import React from 'react'
import { QrCodeWhatsappLite } from './QrCodeWhatsappLite'
import { ChevronLeftIcon } from '@/components/icons'
import { createId } from '@paralleldrive/cuid2'

const steps = [
  { title: 'Qr code' },
  { title: 'Sucesso!' },
]

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
  const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  const { mutate } = trpc.credentials.createCredentials.useMutation({
    // onMutate: () => setIsCreating(true),
    // onSettled: () => setIsCreating(false),
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
    const response = await fetch('https://whatsapp_orchestrator.funnelhub.io/sessions/load-client', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        notifyMessagesWebhook: ""
      })
    })

    if (response.status !== 201) return

    await new Promise((resolve) => setTimeout(resolve, 3000));
    const clientResponse = await fetch(`https://whatsapp_orchestrator.funnelhub.io/sessions/${sessionId}/client-dns`, {
      method: 'GET',
      body: JSON.stringify({
        sessionId,
        notifyMessagesWebhook: ""
      })
    })

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
            {activeStep > 0 && (
              <IconButton
                icon={<ChevronLeftIcon />}
                aria-label={'Go back'}
                variant="ghost"
                onClick={goToPrevious}
              />
            )}
            <Heading size="md">Conecte-se com o whatsapp lite!</Heading>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="10">
          <Stepper index={activeStep} size="sm" pt="4">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
          {activeStep === 0 && workspace && <QrCodeWhatsappLite workspaceId={workspace.id} isOpenModal={isOpen} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

