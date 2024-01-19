import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { customAdapter } from '@/features/auth/api/customAdapter'
import { AdapterUser } from 'next-auth/adapters'

export const createUser = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/users',
      protect: true,
      summary: 'Create user',
      tags: ['Users'],
    },
  })
  .input(
	z.object({
	  id: z.string(),
	  name: z.string(),
	  email: z.string().email()
	})
  )
  .output(
    z.object({
      id: z.string(),
	  email: z.string().email()
    })
  )
  .mutation(async ({ input }) => {
    const adapter = customAdapter(prisma)

	return await adapter.createUser?.(
	  input as unknown as Omit<AdapterUser, "id">
	)
  })
