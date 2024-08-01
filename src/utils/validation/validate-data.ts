import { z } from 'zod'
import { createValidationError } from '../error/create-validation-error'
import { ValidationError } from '../error/custom/validation-error'
import { validateValue } from '../type-guard/validate-value'

type Params<T> = {
  requestId: string
  dataSchema: T
  data: unknown
}

export function validateData<T extends z.ZodTypeAny>({
  requestId,
  dataSchema,
  data,
}: Params<T>): z.infer<T> | ValidationError {
  try {
    validateValue(dataSchema, data)
    return data
  } catch (err) {
    if (err instanceof z.ZodError) {
      return createValidationError(requestId, err)
    }

    throw err
  }
}
