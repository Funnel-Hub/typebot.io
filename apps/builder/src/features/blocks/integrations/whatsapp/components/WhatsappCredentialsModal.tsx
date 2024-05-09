/* eslint-disable react-hooks/exhaustive-deps */
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
  Text,
} from '@chakra-ui/react'
import { createId } from '@paralleldrive/cuid2'
import { useTranslate } from '@tolgee/react'
import { WhatsappOperationTypes } from '@typebot.io/bot-engine/whatsapp/WhatsappComponentFlow/WhatsappOperationType'
import { env } from '@typebot.io/env'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Socket, io } from 'socket.io-client'
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from 'next-auth/react'


type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

export const WhatsappCredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  const { t } = useTranslate()

  const stepMessages = {
    loadingQrCode: t(
      'editor.blocks.integrations.whatsapp.WhatsappCredetialsModal.loadingQrCode'
    ),
    loadingAuthentication: t(
      'editor.blocks.integrations.whatsapp.WhatsappCredetialsModal.processingAuthentication'
    ),
    authFailure: t(
      'editor.blocks.integrations.whatsapp.WhatsappCredetialsModal.authFailure'
    ),
  }

  const { workspace } = useWorkspace()
  const { data: sessionData } = useSession()
  console.log(sessionData)
  const { typebot } = useTypebot()
  const { showToast } = useToast()
  const [whatsappQrCode, setWhatsappQrCode] = useState<string | null>(null)
  const [processAuthWppLoading, setProcessAuthWppLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)
  const isFinishedLoadingScreenWhatsapp = useRef(false)
  const [stepLoadingMessage, setStepLoadingMessage] = useState<string | null>(
    stepMessages.loadingQrCode
  )
  const [authFailure, setAuthFailure] = useState(false)
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

  const handleBackToOriginalState = () => {
    setStepLoadingMessage(stepMessages.loadingQrCode)
    setProcessAuthWppLoading(true)
    setWhatsappQrCode(null)
    setAuthFailure(false)
  }

  const handleStartWebsocket = useCallback(async () => {
    if (!workspace || !typebot) return

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    const now = new Date().getTime()
    const socketClient = io('wss://whatsapp.funnelhub.io:2053', {
      autoConnect: true,
      rejectUnauthorized: false,
      query: {
        clientId: `${workspace.id}_${now}`,
        operationType: WhatsappOperationTypes.QR_CODE,
      },
    })

    socketClient.on('qr', (payload: { qr: string }) => {
      if (
        (stepLoadingMessage === stepMessages.loadingQrCode &&
          !isFinishedLoadingScreenWhatsapp.current) ||
        isFinishedLoadingScreenWhatsapp.current
      ) {
        if (isFinishedLoadingScreenWhatsapp.current) setAuthFailure(true)
        setWhatsappQrCode(payload.qr)
        setProcessAuthWppLoading(false)
        setStepLoadingMessage(stepMessages.loadingQrCode)
        isFinishedLoadingScreenWhatsapp.current = false
      }
    })

    socketClient.on('loading', (payload: { percent: number }) => {
      setProcessAuthWppLoading(true)
      setStepLoadingMessage(stepMessages.loadingAuthentication)
      setAuthFailure(false)
      if (payload.percent === 100)
        isFinishedLoadingScreenWhatsapp.current = true
    })

    socketClient.on('ready', (payload: { phoneNumber: string }) => {
      mutate({
        credentials: {
          id: createId(),
          type: 'whatsAppSocket',
          workspaceId: workspace.id,
          name: `whatsApp-${payload.phoneNumber}`,
          data: {
            clientId: `${workspace.id}_${now}`,
            phoneNumber: payload.phoneNumber as string,
          },
        },
      })
      handleBackToOriginalState()
    })

    socketRef.current = socketClient
  }, [mutate, typebot, workspace])

  const handleEndWebSocket = useCallback(() => {
    socketRef.current?.close()
    handleBackToOriginalState()
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
        <ModalHeader>
          {t(
            'editor.blocks.integrations.whatsapp.WhatsappCredentialsModal.ModalHeader'
          )}
        </ModalHeader>
        <ModalCloseButton />
        <Flex alignItems="center" justifyContent="center" padding={5}>
          {!!whatsappQrCode &&
            !processAuthWppLoading &&
            !(stepLoadingMessage === stepMessages.loadingAuthentication) && (
              <Flex
                alignItems="center"
                justifyContent="center"
                direction="column"
                gap={4}
              >
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  direction="column"
                  border={sessionData?.user?.preferredAppAppearance === 'dark' ? 'none' : '2px'}

                >
                  <QRCodeSVG value={whatsappQrCode} size={360} level='M' bgColor='#000' fgColor='#FFF' />
                </Flex>

                {!!authFailure && <Text>{stepMessages.authFailure}</Text>}
              </Flex>
            )}
          {processAuthWppLoading && (
            <Flex alignItems={'center'} direction="column" gap={8}>
              <Spinner size={'xl'} />
              <Text>{stepLoadingMessage}</Text>
            </Flex>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  )
}
