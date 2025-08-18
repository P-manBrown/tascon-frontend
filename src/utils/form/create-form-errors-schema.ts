import { z } from 'zod'

export function createFormErrorsSchema<
  T extends
    | z.ZodLiteral<string>
    | z.ZodEnum<[string, ...string[]]>
    | z.ZodEffects<z.ZodLiteral<string> | z.ZodEnum<[string, ...string[]]>>,
>(attributeSchema: T) {
  const errorObjectSchema = z.object({
    attribute: attributeSchema,
    type: z.string(),
    full_message: z.string(),
  })

  return z.union([
    z.object({
      errors: z.array(errorObjectSchema),
    }),
    z.object({
      error: errorObjectSchema,
    }),
  ])
}
