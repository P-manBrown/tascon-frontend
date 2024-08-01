import { z } from 'zod'
import { logger } from '@/lib/pino/logger'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { isValidValue } from '@/utils/type-guard/is-valid-data'
import { validateValue } from '@/utils/type-guard/validate-value'
import { validateContentType } from '@/utils/validation/validate-content-type'
import { errorMessageSchema } from './_schemas/error-message'
import { serializeError } from './_utils/serialize-error'
import type { NextRequest } from 'next/server'

const dataSchema = z.object({
  level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
  messages: z
    .tuple([
      z.union([
        z.record(z.string(), z.unknown()),
        z.string(),
        z.array(z.unknown()),
        z.number(),
        z.null(),
      ]),
    ])
    .rest(z.any()),
})

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req.headers)

  try {
    validateContentType(requestId, req.headers)
    const data: unknown = await req.json()

    validateValue(dataSchema, data)
    const { level, messages } = data

    if (isValidValue(errorMessageSchema, messages[0])) {
      messages[0] = serializeError(messages[0])
    }

    logger[level](...messages)

    return new Response('Message has been successfully logged on the server', {
      status: 200,
    })
  } catch (err) {
    logger.error({ err, requestId })

    return new Response('An error occurred while logging on the server', {
      status: 500,
    })
  }
}
