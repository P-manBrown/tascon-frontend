import { z } from 'zod'
import { fetchData } from '@/utils/api/fetch-data'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

type Params = {
  csrfToken: string
  email: string
}

const dataSchema = z.object({
  success: z.literal(true),
  message: z.string(),
})

export async function resendConfirmationEmail({
  csrfToken,
  ...bodyData
}: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth/confirmation`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        ...bodyData,
        redirect_url: `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/login`,
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

  return validateDataResult
}
