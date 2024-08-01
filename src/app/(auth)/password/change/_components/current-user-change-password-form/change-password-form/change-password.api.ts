import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import { z } from 'zod'
import { authSchema } from '@/schemas/response/auth'
import { fetchData } from '@/utils/api/fetch-data'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

type Params = {
  csrfToken: string
  currentPassword?: string
  password: string
}

const dataSchema = z.object({
  success: z.boolean(),
  data: authSchema.omit({ avatar_url: true }),
  message: z.string(),
})

export async function changePassword({ csrfToken, ...bodyData }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth/password`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        ...snakecaseKeys(bodyData, { deep: false }),
        password_confirmation: bodyData.password,
      }),
      credentials: 'include',
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

  const camelcaseData = camelcaseKeys(validateDataResult, { deep: true })
  return camelcaseData
}
