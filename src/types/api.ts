import { z } from 'zod'
import { changeUserInfoDataSchema } from '@/schemas/response/change-user-info-success'
import type { ErrorObject, Errors } from './error'
import type { CamelCaseKeys } from 'camelcase-keys'

export type ResultObject<T extends Record<string, unknown>> =
  | ({
      status: 'success'
    } & T)
  | ErrorObject<Errors>

export type ChangeUserInfoData = CamelCaseKeys<
  z.infer<typeof changeUserInfoDataSchema>,
  true
>
