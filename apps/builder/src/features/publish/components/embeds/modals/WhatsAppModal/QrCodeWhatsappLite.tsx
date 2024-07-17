import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Flex, Spinner, Text } from '@chakra-ui/react'
import { QRCodeSVG } from 'qrcode.react'
import { Socket, io } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { env } from '@typebot.io/env'
import { WhatsappLiteType, WhatsappOperationTypes } from '@typebot.io/bot-engine/whatsapp/WhatsappComponentFlow/WhatsappOperationType'

type Props = {
  credentialId: string
  workspaceId: string
  isOpenModal: boolean
  onSucess: (sessionId: string, phoneNumberId: string) => Promise<void>
}

export const QrCodeWhatsappLite = ({
  workspaceId,
  isOpenModal,
  onSucess,
  credentialId
}: Props) => {
  const [whatsappQrCode, setWhatsappQrCode] = useState<string | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)
  const { data: sessionData } = useSession()

  const handleEndWebSocket = useCallback(() => {
    socketRef.current?.close()
    setWhatsappQrCode(undefined)
  }, [])

  const handleStartWebsocket = useCallback(async () => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    const now = new Date().getTime()
    const sessionId = `${workspaceId}-${now}`
    const socketClient = io(env.NEXT_PUBLIC_WHATSAPP_SERVER, {
      autoConnect: true,
      rejectUnauthorized: false,
      query: {
        clientId: sessionId,
        operationType: WhatsappOperationTypes.QR_CODE,
        whatsappType: WhatsappLiteType.REVERSE_FLOW,
        webhookReverseFlow: `https://bot.funnelhub.io/api/v1/workspaces/${workspaceId}/whatsapp-lite/${credentialId}/webhook`,
      },
    })

    socketClient.on('qr', (payload: { qr: string }) => {
      setWhatsappQrCode(payload.qr)
      setIsLoading(false)
    })

    socketClient.on('ready', async (payload: { phoneNumber: string }) => {
      await onSucess(sessionId, payload.phoneNumber)
    })
    socketRef.current = socketClient
  }, [credentialId, onSucess, workspaceId])

  useEffect(() => {
    if (isOpenModal) handleStartWebsocket()
    else handleEndWebSocket()
  }, [isOpenModal, handleStartWebsocket, handleEndWebSocket])

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      direction="column"
      gap={4}
    >
      {whatsappQrCode && !isLoading && (
        <Flex
          alignItems="center"
          justifyContent="center"
          direction="column"
          border={
            sessionData?.user?.preferredAppAppearance === 'dark'
              ? 'none'
              : '2px'
          }
          width={'280px'}
          height={'280px'}
        >
          <QRCodeSVG
            value={whatsappQrCode}
            size={250}
            level="M"
            bgColor="#000"
            fgColor="#FFF"
          />
        </Flex>
      )}
      {isLoading && (
        <Flex alignItems={'center'} direction="column" gap={8}>
          <Spinner size={'xl'} />
          <Text>
            {!whatsappQrCode && 'Carregando qrcode...'}
            {whatsappQrCode && 'Processando autenticação...'}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
