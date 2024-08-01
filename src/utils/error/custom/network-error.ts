type Params = {
  requestId: string
  cause: unknown
  message?: string
}

export class NetworkError extends TypeError {
  requestId: string

  constructor({ requestId, cause, message }: Params) {
    super(message ?? 'ネットワークエラーが発生しました。')
    this.name = 'NetworkError'
    this.requestId = requestId
    this.cause = cause
  }
}
