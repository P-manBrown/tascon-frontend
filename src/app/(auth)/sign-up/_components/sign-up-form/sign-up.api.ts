'use server'

import camelcaseKeys from 'camelcase-keys'
import { z } from 'zod'
import { accountSchema } from '@/schemas/response/account'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'

type Params = {
  name: string
  email: string
  password: string
}

type Data = CamelCaseKeys<z.infer<typeof accountSchema>, true>

export async function signUp(bodyData: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...bodyData,
        confirm_success_url: `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/login`,
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
      const { account } = camelcaseKeys(validateDataResult, { deep: true })
      resultObject = { status: 'success', account }
    }
  }

  return resultObject
}
