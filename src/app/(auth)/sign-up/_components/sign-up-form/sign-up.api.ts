'use server'

import camelcaseKeys from 'camelcase-keys'
import { z } from 'zod'
import { authSchema } from '@/schemas/response/auth'
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

const dataSchema = z.object({
  status: z.literal('success'),
  data: authSchema.omit({ avatar_url: true }),
})

type Data = CamelCaseKeys<z.infer<typeof dataSchema>, true>

export async function signUp({ ...bodyData }: Params) {
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
    const validateDataResult = validateData({ requestId, dataSchema, data })

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult)
    } else {
      resultObject = camelcaseKeys(validateDataResult, { deep: true })
    }
  }

  return resultObject
}
