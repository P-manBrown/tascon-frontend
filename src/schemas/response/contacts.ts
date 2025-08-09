import { z } from 'zod'

export const contactSchema = z.object({
  contact: z.object({
    id: z.number(),
    display_name: z.string().optional(),
    note: z.string().optional(),
    contact_user: z.object({
      id: z.number(),
      name: z.string(),
      bio: z.string().optional(),
      avatar_url: z.string().optional(),
    }),
  }),
})
