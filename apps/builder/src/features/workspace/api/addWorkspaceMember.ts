import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { WorkspaceRole } from '@typebot.io/prisma'
import { TRPCError } from '@trpc/server'

export const addWorkspaceMember = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/workspaces/{workspaceId}/members/{memberId}',
      protect: true,
      summary: 'Add a member in Workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      memberId: z.string(),
      role: z.nativeEnum(WorkspaceRole),
      workspaceId: z.string(),
    })
  )
  .use(async ({ ctx, next, input: { memberId, workspaceId } }) => {
    const [user, workspace] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: memberId,
        },
      }),
      prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
      }),
    ])

    if (!user || !workspace) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User or Workspace not found',
      })
    }

    return next({ ctx })
  })
  .use(async ({ ctx, next, input: { memberId, workspaceId } }) => {
    const userAlreadyInWorkspace = await prisma.memberInWorkspace.findUnique({
      where: {
        userId_workspaceId: {
          workspaceId,
          userId: memberId,
        },
      },
    })

    if (userAlreadyInWorkspace) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User is already a member of that Workspace',
      })
    }

    return next({ ctx })
  })
  .output(
    z.object({
      success: z.boolean(),
    })
  )
  .mutation(async ({ input: { memberId, role, workspaceId } }) => {
    try {
      await prisma.memberInWorkspace.create({
        data: {
          role,
          workspaceId,
          userId: memberId,
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
