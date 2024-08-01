type Params = {
  requestId: string
  contentType: string | null
}

export class ContentTypeError extends TypeError {
  requestId: string

  constructor({ requestId, contentType }: Params) {
    super(
      `Invalid content type: expected 'application/json', received '${contentType}'`
    )
    this.name = 'ContentTypeError'
    this.requestId = requestId
  }
}
