import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import {
  Flex,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text
} from '@chakra-ui/react'
import { createId } from '@paralleldrive/cuid2'
import { useQRCode } from 'next-qrcode'
import { useCallback, useEffect, useRef, useState } from 'react'
type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

const stepMessages = {
  loadingQrCode: 'Gerando QR code...',
  loadingAuthentication: 'Processando autenticação...'
}

export const WhatsappCredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials
}: Props) => {
  const { workspace } = useWorkspace()
  const { typebot } = useTypebot()
  const { SVG } = useQRCode();
  const { showToast } = useToast()
  const [whatsappQrCode, setWhatsappQrCode] = useState<string | null>(null)
  const [processAuthWppLoading, setProcessAuthWppLoading] = useState(true)
  const [stepLoadingMessage, setStepLoadingMessage] = useState<string | null>(stepMessages.loadingQrCode)
  const socketRef = useRef<WebSocket | null>(null)


  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext()

  const { mutate } = trpc.credentials.createCredentials.useMutation({
    onError: (err: { message: string }) => {
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


  const handleStartWebsocket = useCallback(async () => {
    if (!workspace || !typebot) return;

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WHATSAPP_SERVER!}?clientId=${workspace.id}_${typebot.id}`)
    socket.onmessage = function (event) {
      if (!event.data) return
      if (event.data) {
        const payloadParsed = JSON.parse(event.data ?? '{}')

        switch (payloadParsed.status) {
          case 'qr':
            if (stepLoadingMessage === stepMessages.loadingAuthentication) return
            setWhatsappQrCode(payloadParsed.qr)
            setProcessAuthWppLoading(false)
            break;
          case 'loading':
            setProcessAuthWppLoading(true)
            setStepLoadingMessage(stepMessages.loadingAuthentication)
            break;
          case 'ready':
            mutate({
              credentials: {
                id: createId(),
                type: 'whatsApp',
                workspaceId: workspace.id,
                name: `whatsApp-${payloadParsed.phoneNumber}`,
                data: {
                  clientId: `${workspace.id}_${typebot.id}`,
                  createdAt: new Date().toISOString(),
                }
              },
            })
            setStepLoadingMessage(stepMessages.loadingQrCode)
            setProcessAuthWppLoading(true)
            setWhatsappQrCode(null)
        }
      }
    };

    socketRef.current = socket
  }, [mutate, typebot, workspace])

  const handleEndWebSocket = useCallback(() => {
    socketRef.current?.close()
    onClose()
  }, [onClose])



  useEffect(() => {
    if (isOpen) handleStartWebsocket()
    else handleEndWebSocket()
  }, [isOpen, handleStartWebsocket, handleEndWebSocket])

  return (
    <Modal isOpen={isOpen} onClose={handleEndWebSocket} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Whatsapp account</ModalHeader>
        <ModalCloseButton />
        <Flex alignItems="center" justifyContent="center" padding={5}>
          {!!whatsappQrCode && !processAuthWppLoading && !(stepLoadingMessage === stepMessages.loadingAuthentication) && (
            <SVG
              text={whatsappQrCode}
              options={{
                type: 'image/jpeg',
                quality: 0.3,
                errorCorrectionLevel: 'M',
                margin: 3,
                scale: 5,
                width: 200
              }}
            />
          )}
          {processAuthWppLoading && (
            <Flex alignItems={"center"} direction="column" gap={8}>
              <Spinner size={"xl"} />
              <Text>{stepLoadingMessage}</Text>
            </Flex>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  )
}
