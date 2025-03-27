import { z } from 'zod'

export const accountSchema = z.object({
  account: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    is_private: z.boolean(),
    bio: z.string().optional(),
    avatar_url: z.string().optional(),
  }),
})
