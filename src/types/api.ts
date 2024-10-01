import type { ErrorObject, Errors } from './error'

export type ResultObject<T extends Record<string, unknown>> =
  | ({
      status: 'success'
    } & T)
  | ErrorObject<Errors>
