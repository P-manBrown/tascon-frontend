import type pino from 'pino'

const maxRetries = 5

export function sendLogWithRetries(
  level: pino.Level,
  messages: pino.LogEvent['messages'],
) {
  const requestId = crypto.randomUUID()

  const sendLog = async (retryCount = 0) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/api/log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': requestId,
          },
          body: JSON.stringify({ level, messages }),
          keepalive: true,
          credentials: 'omit',
        },
      )

      if ([408, 429].includes(res.status) || res.status >= 500) {
        throw new Error(`Failed to send log: ${res.statusText}`)
      }
    } catch {
      if (retryCount >= maxRetries) return
      const backoff = Math.min(Math.pow(2, retryCount) * 1000, 32000)
      const jitter = Math.random() * 1000
      const jitteredBackoff = backoff + jitter

      await new Promise((resolve) => setTimeout(resolve, jitteredBackoff))

      void sendLog(retryCount + 1)
    }
  }

  void sendLog()
}
