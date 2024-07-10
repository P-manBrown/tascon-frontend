import type { errorMessageSchema } from '../_schemas/error-message'
import type { z } from 'zod'

type ErrorMessage = z.infer<typeof errorMessageSchema>

export function serializeError(errorMessage: ErrorMessage) {
  const hasErr = 'err' in errorMessage

  let oldErrorMessage
  if (hasErr) {
    oldErrorMessage = errorMessage.err
  } else {
    oldErrorMessage = errorMessage
  }

  const { msg, type, stack, cause, ...messageRest } = oldErrorMessage
  const { message: causeMessage, stack: causeStack } = cause ?? {}
  const newErrorMessage = {
    err: {
      type,
      message: causeMessage ? `${msg}: ${causeMessage}` : msg,
      stack: causeStack ? `${stack}\ncaused by: ${causeStack}` : stack,
      ...messageRest,
    },
    msg,
  }

  if (hasErr) {
    return { ...errorMessage, ...newErrorMessage }
  } else {
    return newErrorMessage
  }
}
