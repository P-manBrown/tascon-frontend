import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import { changeUserInfoDataSchema } from '@/schemas/response/change-user-info-success'
import { fetchData } from '@/utils/api/fetch-data'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

type Params =
  | {
      csrfToken: string
      avatar: File
    }
  | {
      csrfToken: string
      avatar: null
    }

export async function changeAvatar({ csrfToken, ...bodyData }: Params) {
  let reqHeaders: Record<string, string> = {
    'X-CSRF-Token': csrfToken,
  }
  let body: FormData | string
  if (bodyData.avatar === null) {
    reqHeaders = {
      ...reqHeaders,
      'Content-Type': 'application/json',
    }
    body = JSON.stringify(bodyData)
  } else {
    const snakecaseBodyData = snakecaseKeys(bodyData, { deep: false })
    const formData = new FormData()
    Object.entries(snakecaseBodyData).forEach(
      ([key, value]: [string, string | File]) => {
        formData.append(key, value)
      }
    )
    body = formData
  }

  const fetchDataResult = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth`,
    {
      method: 'PATCH',
      headers: reqHeaders,
      body,
      credentials: 'include',
    }
  )
  if (fetchDataResult instanceof Error) {
    return fetchDataResult
  }

  const { headers: resHeaders, data } = fetchDataResult
  const requestId = getRequestId(resHeaders)

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
