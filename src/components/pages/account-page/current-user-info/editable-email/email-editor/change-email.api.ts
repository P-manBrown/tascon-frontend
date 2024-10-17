import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import { changeUserInfoDataSchema } from '@/schemas/response/change-user-info-success'
import { fetchData } from '@/utils/api/fetch-data'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

type Params = {
  csrfToken: string
  email: string
  confirmSuccessUrl: string
}

export async function changeEmail({ csrfToken, ...bodyData }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(snakecaseKeys(bodyData, { deep: false })),
      credentials: 'include',
    },
  )
  if (fetchDataResult instanceof Error) {
    return fetchDataResult
  }

  const { headers, data } = fetchDataResult
  const requestId = getRequestId(headers)

  const validateDataResult = validateData({
    requestId,
    dataSchema: changeUserInfoDataSchema,
    data,
  })
  if (validateDataResult instanceof Error) {
    return validateDataResult
  }

  const camelcaseData = camelcaseKeys(validateDataResult, { deep: true })
  return camelcaseData
}
