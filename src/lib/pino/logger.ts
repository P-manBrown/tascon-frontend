import pino from 'pino'
import { sendLogWithRetries } from './send-log-with-retries.api'

const isProduction = process.env.NODE_ENV === 'production'

export const logger = pino({
  name: 'tascon-frontend',
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: (err: Error | Record<'err', unknown>) => {
      return err instanceof Error ? pino.stdSerializers.err(err) : err
    },
  },
  browser: {
    // See https://github.com/pinojs/pino/issues/1795
    write: () => void {},
    transmit: {
      send: (level, logEvent) => {
        const messages = logEvent.messages
        if (messages[0].cause && messages[0].cause instanceof Error) {
          messages[0].cause = {
            message: messages[0].cause.message,
            stack: messages[0].cause.stack,
          }
        }

        sendLogWithRetries(level, messages)
      },
    },
  },
  ...(isProduction
    ? {
        level: 'info',
      }
    : {
        level: 'trace',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }),
})
