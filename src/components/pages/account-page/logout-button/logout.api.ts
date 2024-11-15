'use server'

import { z } from 'zod'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import {
  deleteAuthorization,
  getAuthorization,
} from '@/utils/cookie/authorization'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.object({
  success: z.literal(true),
})

type Data = z.infer<typeof dataSchema>

export async function logout() {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/sign_out`,
    {
      method: 'DELETE',
      headers: {
        Authorization: getAuthorization(),
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
      resultObject = {
        status: 'success',
        ...validateDataResult,
      }
      deleteAuthorization()
    }
  }

  return resultObject
}
