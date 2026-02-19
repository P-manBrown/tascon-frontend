import type { z } from 'zod'

export function isValidValue<T extends z.ZodType>(
  schema: T,
  value: unknown,
): value is z.infer<T> {
  return schema.safeParse(value).success
}
