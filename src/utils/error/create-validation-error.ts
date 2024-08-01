import { logger } from '@/lib/pino/logger'
import { ValidationError } from './custom/validation-error'

export function createValidationError(requestId: string, cause?: Error) {
  const validationError = new ValidationError({ requestId, cause })

  logger.fatal(validationError)
  return validationError
}
