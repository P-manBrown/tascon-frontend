'use server'

import camelcaseKeys from 'camelcase-keys'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { authSchema } from '@/schemas/response/auth'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { proxyServerCookies } from '@/utils/cookie/proxy-server-cookies'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'

type Params = {
  csrfToken: string
  email: string
  password: string
}

const dataSchema = z.object({
  data: authSchema.omit({
    avatar_url: true,
    created_at: true,
    updated_at: true,
  }),
})

type Data = CamelCaseKeys<z.infer<typeof dataSchema>, true>

export async function login({ csrfToken, ...bodyData }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth/sign_in`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(bodyData),
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
        ...camelcaseKeys(validateDataResult, { deep: true }),
      }
      proxyServerCookies(headers)
    }
  }

  return resultObject
}
