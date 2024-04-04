import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'

export const removeWorkspaceMember = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/workspaces/{workspaceId}/members/{memberId}',
      protect: true,
      summary: 'Remove a member from a Workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      memberId: z.string(),
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
    })
  )
  .mutation(async ({ input: { memberId, workspaceId } }) => {
    try {
      await prisma.memberInWorkspace.delete({
        where: {
          userId_workspaceId: {
            workspaceId,
            userId: memberId,
          },
        },
      })

      return {
        success: true,
      }
    } catch (error) {
      console.error(error)
      return {
        success: false,
      }
    }
  })
