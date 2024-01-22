import { router } from '@/helpers/server/trpc'
import { createUser } from './createUser'

export const userRouter = router({
  createUser,
})
