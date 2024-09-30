type Params = {
  requestId: string
  cause?: Error
  message?: string
}

export class ValidationError extends Error {
  name: 'ValidationError'
  requestId: string

  constructor({ cause, requestId, message }: Params) {
    super(message ?? 'Validation failed due to schema mismatch.')
    this.name = 'ValidationError'
    this.cause = cause
    this.requestId = requestId
  }
}
