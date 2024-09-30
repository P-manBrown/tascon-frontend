import type { ContentTypeError } from '@/utils/error/custom/content-type-error'
import type { HttpError } from '@/utils/error/custom/http-error'
import type { NetworkError } from '@/utils/error/custom/network-error'
import type { UnexpectedError } from '@/utils/error/custom/unexpected-error'
import type { ValidationError } from '@/utils/error/custom/validation-error'

export type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export type Errors =
  | ContentTypeError
  | HttpError
  | NetworkError
  | UnexpectedError
  | ValidationError

export type ErrorBaseObject = Pick<Errors, 'message' | 'requestId'> & {
  status: 'error'
}

export type ErrorObject<T extends Errors> = T extends HttpError
  ? Pick<T, 'name' | 'statusCode'> & ErrorBaseObject
  : Pick<T, 'name'> & ErrorBaseObject
