import { TRPCError, initTRPC } from '@trpc/server'
import { Context } from './context'
import { OpenApiMeta } from '@lilyrose2798/trpc-openapi'
import superjson from 'superjson'
import * as Sentry from '@sentry/nextjs'
import { ZodError } from 'zod'
import { env } from '@typebot.io/env'
import { extractBearerToken } from '@/lib/trpc'

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      }
    },
  })

const sentryMiddleware = t.middleware(
  Sentry.Handlers.trpcMiddleware({
    attachRpcInput: true,
  })
)

const isAuthed = t.middleware(({ next, ctx }) => {
  const bearerToken = extractBearerToken(ctx.req)

  if (!ctx.user?.id && bearerToken !== env.WORKSPACE_TOKEN) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    })
  }

  return next({
    ctx: {
      user: ctx?.user,
    },
  })
})

const finalMiddleware = sentryMiddleware.unstable_pipe(isAuthed)

export const middleware = t.middleware

export const router = t.router
export const mergeRouters = t.mergeRouters

export const publicProcedure = t.procedure.use(sentryMiddleware)

export const authenticatedProcedure = t.procedure.use(finalMiddleware)
