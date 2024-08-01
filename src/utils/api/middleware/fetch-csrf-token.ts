import camelcaseKeys from 'camelcase-keys'
import { z } from 'zod'
import { getRequestId } from '../../request-id/get-request-id'
import { validateData } from '../../validation/validate-data'
import { fetchData } from '../fetch-data'

const dataSchema = z.object({
  csrf_token: z.string(),
})

const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export async function fetchCsrfToken() {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/csrf_token`,
    {
      method: 'GET',
      headers: {
        ...(origin && { Origin: origin }),
      },
    }
  )
  if (fetchDataResult instanceof Error) {
    return fetchDataResult
  }

  const { headers, data } = fetchDataResult
  const requestId = getRequestId(headers)

  const validateDataResult = validateData({ requestId, dataSchema, data })
  if (validateDataResult instanceof Error) {
    return validateDataResult
  }

  const camelcaseData = camelcaseKeys(validateDataResult, { deep: false })

  return { headers, data: camelcaseData }
}
