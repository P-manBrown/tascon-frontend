import { z } from 'zod'

export function createFormErrorsSchema<
  T extends
    | z.ZodLiteral<string>
    | z.ZodEnum<Record<string, string>>
    | z.ZodPipe<
        z.ZodLiteral<string> | z.ZodEnum<Record<string, string>>,
        z.ZodType
      >,
>(sourceSchema: T) {
  const errorObjectSchema = z.object({
    source: sourceSchema,
    type: z.string(),
    message: z.string(),
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
