import type { ErrorObject, Errors } from './error'
import type { accountSchema } from '@/schemas/response/account'
import type { CamelCaseKeys } from 'camelcase-keys'
import type { z } from 'zod'

export type ResultObject<T extends Record<string, unknown>> =
  | (T extends { status: 'success' } & Record<string, unknown>
      ? T
      : { status: 'success' } & T)
  | ErrorObject<Errors>

export type ChangeUserInfoData = CamelCaseKeys<
  z.infer<typeof accountSchema>,
  true
>
