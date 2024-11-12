'use server'

import camelcaseKeys from 'camelcase-keys'
import { cookies } from 'next/headers'
import snakecaseKeys from 'snakecase-keys'
import { changeUserInfoDataSchema } from '@/schemas/response/change-user-info-success'
import { ChangeUserInfoData, ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

type Params = {
  email: string
  confirmSuccessUrl: string
}

export async function changeEmail({ ...bodyData }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(snakecaseKeys(bodyData, { deep: false })),
    },
  )
  let resultObject: ResultObject<ChangeUserInfoData>

  if (fetchDataResult instanceof Error) {
    resultObject = createErrorObject(fetchDataResult)
  } else {
    const { headers, data } = fetchDataResult
    const requestId = getRequestId(headers)
    const validateDataResult = validateData({
      requestId,
      dataSchema: changeUserInfoDataSchema,
      data,
    })

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult)
    } else {
      resultObject = camelcaseKeys(validateDataResult, { deep: true })
    }
  }

  return resultObject
}
