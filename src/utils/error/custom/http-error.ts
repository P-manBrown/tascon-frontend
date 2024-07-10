type Params = {
  requestId: string
  res: Response
  message?: string
}

export class HttpError extends Error {
  requestId: string
  status: number

  constructor({ requestId, res, message }: Params) {
    super(message ?? 'リクエストの処理中にエラーが発生しました。')
    this.name = 'HttpError'
    this.requestId = requestId
    this.status = res.status
  }
}
