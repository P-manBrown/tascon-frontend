import { z } from 'zod'
import { createValidationError } from '../error/create-validation-error'
import { ValidationError } from '../error/custom/validation-error'

type Params<T> = {
  requestId: string
  dataSchema: T
  data: unknown
}

export function validateData<T extends z.ZodType>({
  requestId,
  dataSchema,
  data,
}: Params<T>): z.infer<T> | ValidationError {
  try {
    const parsedData = dataSchema.parse(data)
    return parsedData
  } catch (err) {
    if (err instanceof z.ZodError) {
      return createValidationError(requestId, err)
    }

    throw err
  }
}
