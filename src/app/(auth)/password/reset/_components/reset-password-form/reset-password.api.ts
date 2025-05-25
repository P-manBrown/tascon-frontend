'use server'

import camelcaseKeys from 'camelcase-keys'
import { cookies } from 'next/headers'
import snakecaseKeys from 'snakecase-keys'
import { z } from 'zod'
import { accountSchema } from '@/schemas/response/account'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken, setBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'

type Params = {
  password: string
}

type Data = CamelCaseKeys<z.infer<typeof accountSchema>, true>

export async function resetPassword(bodyData: Params) {
  const cookieStore = await cookies()

  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/password`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getBearerToken(),
      },
      body: JSON.stringify({
        ...snakecaseKeys(bodyData, { deep: false }),
        password_confirmation: bodyData.password,
        reset_password_token: cookieStore.get('resetPasswordToken')?.value,
      }),
    },
  )

  let resultObject: ResultObject<Data>

  if (fetchDataResult instanceof Error) {
    resultObject = createErrorObject(fetchDataResult)
  } else {
    const { headers, data } = fetchDataResult
    const requestId = getRequestId(headers)

    const validateDataResult = validateData({
      requestId,
      dataSchema: accountSchema,
      data,
    })
    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult)
    } else {
      resultObject = {
        status: 'success',
        ...camelcaseKeys(validateDataResult, { deep: true }),
      }
      const bearerToken = headers.get('Authorization')
      const expiry = headers.get('expiry')
      if (bearerToken !== null && expiry !== null) {
        setBearerToken({ bearerToken, expiry })
      }
      cookieStore.delete('resetPasswordToken')
    }
  }

  return resultObject
}
