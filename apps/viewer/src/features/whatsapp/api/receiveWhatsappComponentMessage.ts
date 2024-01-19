import { publicProcedure } from "@/helpers/server/trpc";
import { resumeWhatsappComponentFlow } from '@typebot.io/bot-engine/whatsapp/WhatsappComponentFlow/resumeWhatsappComponentFlow';
import { z } from "zod";


export const receiveWhatsappComponentMessage = publicProcedure
.meta({
  openapi: {
    method: 'POST',
    path: '/v1/whatsappComponent/webhook',
    summary: 'Message whatsapp component webhook',
    tags: ['WhatsAppComponent'],
  }
}).input(
  z.object({
    sessionId: z.string(),
    message: z.object({
      type: z.string(),
      body: z.string()
    }),
  })
).output(
  z.object({
    message: z.string()
  })
).mutation(async ({ input: { sessionId, message  }}) => {
  console.log(sessionId, message)
  if(message.type !== 'text') return {
    message: 'Only text messages are supported'
  }

  if(!sessionId) return {
    message: 'Session not found'
  }

  const recivedMessage = message.body
  
  return resumeWhatsappComponentFlow({
    message: recivedMessage,
    sessionId
  })
})