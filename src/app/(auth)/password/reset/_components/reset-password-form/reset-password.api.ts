'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

type Params = {
  csrfToken: string
  email: string
}

const dataSchema = z.object({
  success: z.literal(true),
  email: z.string(),
  message: z.string(),
})

type Data = z.infer<typeof dataSchema>

export async function resetPassword({ csrfToken, ...bodyData }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({
        ...bodyData,
        redirect_url: `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/password/change`,
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
        ...validateDataResult,
      }
    }
  }

  return resultObject
}
