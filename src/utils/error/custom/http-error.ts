type Params = {
  requestId: string
  res: Response
  message?: string
}

export class HttpError extends Error {
  name: 'HttpError'
  requestId: string
  statusCode: number
  status: number // TODO: Remove this property in the future

  constructor({ requestId, res, message }: Params) {
    super(message ?? 'リクエストの処理中にエラーが発生しました。')
    this.name = 'HttpError'
    this.requestId = requestId
    this.statusCode = res.status
    this.status = res.status // TODO: Remove this property in the future
  }
}
