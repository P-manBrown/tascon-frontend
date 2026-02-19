import type { z } from 'zod'

export function validateValue<T extends z.ZodType>(
  schema: T,
  value: unknown,
): asserts value is z.infer<T> {
  schema.parse(value)
}
