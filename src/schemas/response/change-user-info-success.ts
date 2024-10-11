import { z } from 'zod'
import { authSchema } from './auth'

export const changeUserInfoDataSchema = z.object({
  status: z.literal('success'),
  data: authSchema,
})
