type Params = {
  requestId: string
  res: Response
  details: unknown
}

export class HttpError extends Error {
  name: 'HttpError'
  requestId: Params['requestId']
  statusCode: Params['res']['status']
  details: Params['details']

  constructor({ requestId, res, details }: Params) {
    super('リクエストの処理中にエラーが発生しました。')
    this.name = 'HttpError'
    this.requestId = requestId
    this.statusCode = res.status
    this.details = details
  }
}
