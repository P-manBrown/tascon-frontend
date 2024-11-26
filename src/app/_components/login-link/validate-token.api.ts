'use server'

import camelcaseKeys, { CamelCaseKeys } from 'camelcase-keys'
import { z } from 'zod'
import { validateTokenDataSchema } from '@/schemas/response/validate-token-success'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

type Data = CamelCaseKeys<z.infer<typeof validateTokenDataSchema>, true>

export async function validateToken() {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/validate_token`,
    {
      method: 'GET',
      headers: {
        Authorization: getBearerToken(),
      },
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
      dataSchema: validateTokenDataSchema,
      data,
    })

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult)
    } else {
      resultObject = {
        status: 'success',
        ...camelcaseKeys(validateDataResult, { deep: true }),
      }
    }
  }

  return resultObject
}
