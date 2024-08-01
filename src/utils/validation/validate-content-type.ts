import { ContentTypeError } from '../error/custom/content-type-error'

export function validateContentType(requestId: string, headers: Headers) {
  const contentType = headers.get('content-type')

  if (!contentType || !contentType.includes('application/json')) {
    throw new ContentTypeError({
      requestId,
      contentType,
    })
  }
}
