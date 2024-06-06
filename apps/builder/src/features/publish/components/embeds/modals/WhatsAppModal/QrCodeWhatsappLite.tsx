
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Flex,
} from '@chakra-ui/react'
import { QRCodeSVG } from 'qrcode.react';
import { Socket, io } from 'socket.io-client'
import { useSession } from 'next-auth/react';
type Props = {
  workspaceId: string
  isOpenModal: boolean
}

export const QrCodeWhatsappLite = ({ workspaceId, isOpenModal }: Props) => {
  const [whatsappQrCode, setWhatsappQrCode] = useState<string | undefined>(undefined)
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
    const socketClient = io('wss://whatsapp_orchestrator.funnelhub.io', {
      autoConnect: true,
      rejectUnauthorized: false,
      query: {
        sessionId: `${workspaceId}_${now}`,
      },
    })

    socketClient.on('qr_code', (payload: { qr: string }) => {
      setWhatsappQrCode(payload.qr)
    })
    socketRef.current = socketClient
  }, [workspaceId])

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
      {whatsappQrCode && (
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
    </Flex>
  )
}