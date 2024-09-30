type Params = {
  requestId: string
  cause: unknown
  message?: string
}

export class UnexpectedError extends Error {
  name: 'UnexpectedError'
  requestId: string

  constructor({ requestId, cause, message }: Params) {
    super(message ?? '予期せぬエラーが発生しました。')
    this.name = 'UnexpectedError'
    this.requestId = requestId
    this.cause = cause
  }
}
