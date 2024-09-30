'use server'

import camelcaseKeys from 'camelcase-keys'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { authSchema } from '@/schemas/response/auth'
import { fetchData } from '@/utils/api/fetch-data'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

type Params = {
  csrfToken: string
  name: string
  email: string
  password: string
}

const dataSchema = z.object({
  status: z.literal('success'),
  data: authSchema.omit({ avatar_url: true }),
})

export async function signUp({ csrfToken, ...bodyData }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({
        ...bodyData,
        confirm_success_url: `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/login`,
      }),
    },
  )

  if (fetchDataResult instanceof Error) {
    const fetchErrorObject = createErrorObject(fetchDataResult)
    return fetchErrorObject
  }

  const { headers, data } = fetchDataResult
  const requestId = getRequestId(headers)

  const validateDataResult = validateData({ requestId, dataSchema, data })
  if (validateDataResult instanceof Error) {
    const validationErrorObject = createErrorObject(validateDataResult)
    return validationErrorObject
  }

  const camelcaseData = camelcaseKeys(validateDataResult, { deep: true })
  return camelcaseData
}
