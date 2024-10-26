'use server'

import camelcaseKeys from 'camelcase-keys'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { changeUserInfoDataSchema } from '@/schemas/response/change-user-info-success'
import { fetchData } from '@/utils/api/fetch-data'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { ChangeUserInfoData, ResultObject } from '@/types/api'

type Params = {
  csrfToken: string
  formData: FormData | null
}

export async function changeAvatar({ csrfToken, formData }: Params) {
  let reqHeaders: Record<string, string> = {
    'X-CSRF-Token': csrfToken,
    Cookie: cookies().toString(),
  }
  let body: FormData | string

  if (formData === null) {
    reqHeaders = {
      'Content-Type': 'application/json',
      ...reqHeaders,
    }
    body = JSON.stringify({ avatar: null })
  } else {
    body = formData
  }

  const fetchDataResult = await fetchData(
    `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/v1/auth`,
    {
      method: 'PATCH',
      headers: reqHeaders,
      body,
    },
  )

  let resultObject: ResultObject<ChangeUserInfoData>

  if (fetchDataResult instanceof Error) {
    resultObject = createErrorObject(fetchDataResult)
  } else {
    const { headers: resHeaders, data } = fetchDataResult
    const requestId = getRequestId(resHeaders)
    const validateDataResult = validateData({
      requestId,
      dataSchema: changeUserInfoDataSchema,
      data,
    })

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult)
    } else {
      resultObject = camelcaseKeys(validateDataResult, { deep: true })
      revalidatePath('/account')
    }
  }

  return resultObject
}
