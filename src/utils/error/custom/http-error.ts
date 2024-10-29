type Params = {
  requestId: string
  res: Response
  message?: string
}

export class HttpError extends Error {
  name: 'HttpError'
  requestId: string
  statusCode: number

  constructor({ requestId, res, message }: Params) {
    super(message ?? 'リクエストの処理中にエラーが発生しました。')
    this.name = 'HttpError'
    this.requestId = requestId
    this.statusCode = res.status
  }
}
