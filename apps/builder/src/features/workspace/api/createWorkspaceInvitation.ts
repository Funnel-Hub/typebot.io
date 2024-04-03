import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { WorkspaceRole } from '@typebot.io/prisma'

export const createWorkspaceInvitation = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/workspaces/{workspaceId}/invitations/{memberId}',
      protect: true,
      summary: 'Create a register in the WorkspaceInvitation table',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      memberId: z.string(),
      type: z.nativeEnum(WorkspaceRole),
      email: z.string().email(),
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      status: z.enum(['SUCCESS', 'CONFLICT', 'NOTFOUND']),
      message: z.string(),
      userFound: z.boolean().optional(),
    })
  )
  .mutation(async ({ input: { email, memberId, type, workspaceId } }) => {
    const [workspace, user, alreadyInvited] = await Promise.all([
      prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
        select: {
          id: true,
        },
      }),
      prisma.user.findUnique({
        where: {
          id: memberId,
        },
        select: {
          id: true,
        },
      }),
      prisma.workspaceInvitation.findFirst({
        where: {
          workspaceId,
          email,
        },
        select: {
          id: true,
        },
      }),
    ])

    if (!workspace)
      return {
        status: 'NOTFOUND',
        message: 'Workspace not found',
      }

    if (user) {
      const userAlreadyInWorkspace = await prisma.memberInWorkspace.findUnique({
        where: {
          userId_workspaceId: {
            userId: memberId,
            workspaceId,
          },
        },
      })

      if (userAlreadyInWorkspace)
        return {
          status: 'CONFLICT',
          message: 'User is already a member of that Workspace',
        }
    } else {
      if (!alreadyInvited) {
        await prisma.workspaceInvitation.create({
          data: { email, type, workspaceId },
        })
      }
    }

    return {
      status: 'SUCCESS',
      message: 'Invitation successfully created',
      userFound: user ? true : false,
    }
  })
