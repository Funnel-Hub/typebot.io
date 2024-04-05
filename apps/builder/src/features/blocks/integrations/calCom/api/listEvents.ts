import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import got from 'got'
import { env } from '@typebot.io/env'

export const listEvents = authenticatedProcedure
  .output(
    z.object({
      events: z
        .object({
          event: z.string(),
        })
        .array(),
    })
  )
  .query(async ({ ctx: { user } }) => {
    const events = await got
      .get(`${env.CALCOM_API_URL}/event-types`, {
        searchParams: {
          userId: user.id,
          workspaceId: user.currentWorkspace.id,
        },
        headers: {
          Authorization: `Bearer ${env.WORKSPACE_TOKEN}`,
        },
        retry: {
          limit: 1,
        },
      })
      .json<{ event: string }[]>()

    return { events }
  })
