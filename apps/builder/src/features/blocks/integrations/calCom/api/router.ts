import { router } from '@/helpers/server/trpc'
import { listEvents } from './listEvents'

export const calComRouter = router({
  listEvents,
})
