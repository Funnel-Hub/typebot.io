
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Flex,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { QRCodeSVG } from 'qrcode.react';
import { Socket, io } from 'socket.io-client'
import { useSession } from 'next-auth/react';

type Props = {
  workspaceId: string
  isOpenModal: boolean
  onSucess: (sessionId: string, phoneNumberId: string) => Promise<void>
}

export const QrCodeWhatsappLite = ({ workspaceId, isOpenModal, onSucess }: Props) => {
  const [whatsappQrCode, setWhatsappQrCode] = useState<string | undefined>(undefined)
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
    const socketClient = io('wss://whatsapp_orchestrator.funnelhub.io', {
      autoConnect: true,
      rejectUnauthorized: false,
      query: {
        sessionId
      },
    })

    socketClient.on('qr_code', (payload: { qr: string }) => {
      setWhatsappQrCode(payload.qr)
      setIsLoading(false)
    })

    socketClient.on('success_session', async (payload: { phone: string }) => {
      setIsLoading(true)
      await onSucess(sessionId, payload.phone)
      setIsLoading(false)
      socketClient.close()
    })
    socketRef.current = socketClient
  }, [onSucess, workspaceId])

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
          border={sessionData?.user?.preferredAppAppearance === 'dark' ? 'none' : '2px'}
          width={'280px'}
          height={'280px'}
        >
          <QRCodeSVG value={whatsappQrCode} size={250} level='M' bgColor='#000' fgColor='#FFF' />
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