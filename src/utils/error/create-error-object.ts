import { ErrorBaseObject, ErrorObject, Errors } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'

export function createErrorObject(err: Errors) {
  const errorBaseObject: ErrorBaseObject = {
    status: 'error',
    message: err.message,
    requestId: err.requestId,
  }

  let errorObject: ErrorObject<Errors>

  if (err instanceof HttpError) {
    errorObject = {
      ...errorBaseObject,
      name: err.name,
      statusCode: err.statusCode,
      data: err.data,
    }
  } else {
    errorObject = {
      ...errorBaseObject,
      name: err.name,
    }
  }

  return errorObject
}
