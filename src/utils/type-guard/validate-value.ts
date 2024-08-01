import type z from 'zod'

export function validateValue<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown
): asserts value is z.infer<T> {
  schema.parse(value)
}
