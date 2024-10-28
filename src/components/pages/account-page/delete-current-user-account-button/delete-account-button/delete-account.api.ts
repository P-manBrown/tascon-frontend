'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.object({
  status: z.literal('success'),
  message: z.string(),
})

type Data = z.infer<typeof dataSchema>

export async function deleteAccount(csrfToken: string) {
  const fetchDataResult = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        Cookie: cookies().toString(),
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
      resultObject = validateDataResult
    }
  }

  return resultObject
}
