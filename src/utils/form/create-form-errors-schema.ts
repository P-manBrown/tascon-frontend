import { z } from 'zod'

export function createFormErrorsSchema<
  T extends z.ZodLiteral<string> | z.ZodEnum<[string, ...string[]]>,
>(attributeSchema: T) {
  return z.object({
    errors: z.array(
      z.object({
        attribute: attributeSchema,
        type: z.string(),
        full_message: z.string(),
      }),
    ),
  })
}
