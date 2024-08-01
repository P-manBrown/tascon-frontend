import 'server-only'
import camelcaseKeys from 'camelcase-keys'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { validateTokenDataSchema } from '@/schemas/response/validate-token-success'
import { getRequestId } from '../../request-id/get-request-id'
import { validateData } from '../../validation/validate-data'
import { fetchData } from '../fetch-data'

export const validateToken = cache(async () => {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/validate_token`,
    {
      method: 'GET',
      headers: {
        Cookie: cookies().toString(),
      },
    }
  )

  if (fetchDataResult instanceof Error) {
    return fetchDataResult
  }

  const { headers, data } = fetchDataResult
  const requestId = getRequestId(headers)

  const validateDataResult = validateData({
    requestId,
    dataSchema: validateTokenDataSchema,
    data,
  })

  if (validateDataResult instanceof Error) {
    return validateDataResult
  }

  const camelcaseData = camelcaseKeys(validateDataResult, { deep: true })
  return camelcaseData
})
