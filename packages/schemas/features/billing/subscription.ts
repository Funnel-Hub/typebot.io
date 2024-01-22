import { z } from '../../zod'

export const subscriptionSchema = z.object({
  currentBillingPeriod: z.object({
    start: z.date(),
    end: z.date(),
  }),
  currency: z.enum(['eur', 'usd', 'brl']),
  cancelDate: z.date().optional(),
  status: z.enum(['active', 'past_due']),
})

export type Subscription = z.infer<typeof subscriptionSchema>
