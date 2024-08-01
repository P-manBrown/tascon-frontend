import { z } from 'zod'

export const authSchema = z.object({
  id: z.number(),
  uid: z.string(),
  allow_password_change: z.boolean(),
  name: z.string(),
  email: z.string(),
  bio: z.string(),
  is_private: z.boolean(),
  avatar_url: z.string().nullable(),
  provider: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
