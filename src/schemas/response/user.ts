import { z } from 'zod'

export const userSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    bio: z.string().optional(),
    avatar_url: z.string().optional(),
    contact: z
      .object({
        id: z.number(),
        display_name: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    is_suggested: z.boolean(),
    block: z
      .object({
        id: z.number(),
      })
      .optional(),
  }),
})
