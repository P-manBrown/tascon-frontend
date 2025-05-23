'use server'

import { z } from 'zod'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken, deleteBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.null()

type Data = z.infer<typeof dataSchema>

export async function deleteAccount() {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getBearerToken(),
      },
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
      resultObject = { status: 'success' }
      deleteBearerToken()
    }
  }

  return resultObject
}
