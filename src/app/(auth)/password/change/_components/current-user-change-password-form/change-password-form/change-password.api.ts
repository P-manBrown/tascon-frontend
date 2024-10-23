'use server'

import camelcaseKeys from 'camelcase-keys'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import snakecaseKeys from 'snakecase-keys'
import { z } from 'zod'
import { authSchema } from '@/schemas/response/auth'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { createErrorObject } from '@/utils/error/create-error-object'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'

type Params = {
  csrfToken: string
  currentPassword?: string
  password: string
}

const dataSchema = z.object({
  success: z.literal(true),
  data: authSchema.omit({ avatar_url: true }),
  message: z.string(),
})

type Data = CamelCaseKeys<z.infer<typeof dataSchema>, true>

export async function changePassword({ csrfToken, ...bodyData }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/password`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({
        ...snakecaseKeys(bodyData, { deep: false }),
        password_confirmation: bodyData.password,
      }),
    },
  )

  let resultObject: ResultObject<Data>

  if (fetchDataResult instanceof Error) {
    const isHttpError = fetchDataResult instanceof HttpError
    const isUnauthorized = isHttpError && fetchDataResult.statusCode === 401
    if (isUnauthorized) {
      const redirectLoginPath = generateRedirectLoginPath()
      redirect(redirectLoginPath)
    }

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
      if (bodyData.currentPassword === undefined) {
        revalidatePath('/password/change')
      }
    }
  }

  return resultObject
}
