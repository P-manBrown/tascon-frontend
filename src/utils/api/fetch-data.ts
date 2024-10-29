import isNetworkError from 'is-network-error'
import { z } from 'zod'
import { logger } from '@/lib/pino/logger'
import { createValidationError } from '../error/create-validation-error'
import { ContentTypeError } from '../error/custom/content-type-error'
import { HttpError } from '../error/custom/http-error'
import { NetworkError } from '../error/custom/network-error'
import { UnexpectedError } from '../error/custom/unexpected-error'
import { isValidValue } from '../type-guard/is-valid-data'
import { validateContentType } from '../validation/validate-content-type'

const errorMessageSchema = z.object({
  errors: z.array(z.string()),
})

type Options = Omit<RequestInit, 'method'> & {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

export async function fetchData(
  url: string,
  { headers, ...optionRest }: Options,
) {
  const requestId = crypto.randomUUID()

  try {
    const res = await fetch(url, {
      headers: {
        'X-Request-Id': requestId,
        ...headers,
      },
      ...optionRest,
    })

    validateContentType(requestId, res.headers)
    const data: unknown = await res.json()

    logger.debug(
      { requestId, method: optionRest.method, url, data },
      'fetchData response data',
    )

    if (!res.ok) {
      let errorMessage
      if (isValidValue(errorMessageSchema, data)) {
        errorMessage = data.errors[0]
      }
      throw new HttpError({
        requestId,
        res,
        message: errorMessage,
      })
    }

    return { headers: res.headers, data }
  } catch (err) {
    if (err instanceof TypeError && isNetworkError(err)) {
      const networkError = new NetworkError({ requestId, cause: err })

      if (typeof window === 'undefined') {
        logger.fatal(networkError)
      }

      return networkError
    }

    if (err instanceof ContentTypeError) {
      logger.fatal(err)
      return err
    }

    if (err instanceof HttpError) {
      if ([401, 404, 422].includes(err.statusCode)) {
        logger.warn(err)
      } else if (400 <= err.statusCode && err.statusCode < 500) {
        logger.error(err)
      } else if (err.statusCode >= 500) {
        logger.fatal(err)
      }
      return err
    }

    if (err instanceof z.ZodError) {
      return createValidationError(requestId, err)
    }

    if (err instanceof Error) {
      const unexpectedError = new UnexpectedError({ requestId, cause: err })

      logger.fatal(unexpectedError)
      return unexpectedError
    }

    throw err
  }
}
