'use server'

import camelcaseKeys from 'camelcase-keys'
import { cookies } from 'next/headers'
import snakecaseKeys from 'snakecase-keys'
import { z } from 'zod'
import { authSchema } from '@/schemas/response/auth'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken, setBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'

type Params = {
  resetPasswordToken: string | null
  currentPassword?: string
  password: string
}

const dataSchema = z.object({
  success: z.literal(true),
  data: authSchema.omit({ avatar_url: true }),
  message: z.string(),
})

type Data = CamelCaseKeys<z.infer<typeof dataSchema>, true>

export async function changePassword({
  resetPasswordToken,
  ...bodyData
}: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/password`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getBearerToken(),
      },
      body: JSON.stringify({
        ...snakecaseKeys(bodyData, { deep: false }),
        password_confirmation: bodyData.password,
        reset_password_token: resetPasswordToken,
      }),
    },
  )

  let resultObject: ResultObject<Data>

  if (fetchDataResult instanceof Error) {
    resultObject = createErrorObject(fetchDataResult)
  } else {
    const { headers, data } = fetchDataResult
    const requestId = getRequestId(headers)

    const validateDataResult = validateData({ requestId, dataSchema, data })
    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult)
    } else {
      resultObject = {
        status: 'success',
        ...camelcaseKeys(validateDataResult, { deep: true }),
      }
      if (resetPasswordToken !== null) {
        const bearerToken = headers.get('Authorization')
        const expiry = headers.get('expiry')
        if (bearerToken !== null && expiry !== null) {
          setBearerToken({ bearerToken, expiry })
        }
        cookies().delete('resetPasswordToken')
      }
    }
  }

  return resultObject
}
