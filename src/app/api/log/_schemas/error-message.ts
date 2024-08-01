import { z } from 'zod'

const errorMessageBaseSchema = z.object({
  type: z.string(),
  msg: z.string(),
  stack: z.string(),
  cause: z
    .object({
      message: z.string(),
      stack: z.string(),
    })
    .optional(),
})

export const errorMessageSchema = z.union([
  errorMessageBaseSchema,
  z.object({
    err: errorMessageBaseSchema,
  }),
])
