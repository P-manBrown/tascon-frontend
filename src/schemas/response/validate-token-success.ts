import { z } from 'zod'
import { authSchema } from '@/schemas/response/auth'

export const validateTokenDataSchema = z.object({
  success: z.literal(true),
  data: authSchema.omit({
    created_at: true,
    updated_at: true,
  }),
})
