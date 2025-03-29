type Params = {
  requestId: string
  res: Response
  data: unknown
}

export class HttpError extends Error {
  name: 'HttpError'
  requestId: Params['requestId']
  statusCode: Params['res']['status']
  data: Params['data']

  constructor({ requestId, res, data }: Params) {
    super('リクエストの処理中にエラーが発生しました。')
    this.name = 'HttpError'
    this.requestId = requestId
    this.statusCode = res.status
    this.data = data
  }
}
