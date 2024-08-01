import { logger } from '@/lib/pino/logger'

export function getRequestId(headers: Headers): string {
  let requestId = headers.get('X-Request-Id')

  if (requestId === null) {
    logger.fatal('X-Request-Id is not found in response headers')
    requestId = 'unknown'
  }

  return requestId
}
