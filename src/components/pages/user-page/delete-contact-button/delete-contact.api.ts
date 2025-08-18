'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.null()

type Data = z.infer<typeof dataSchema>

type Params = {
  contactId: string
  contactUserId: string
}

export async function deleteContact({ contactId, contactUserId }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/contacts/${contactId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: await getBearerToken(),
      },
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
      resultObject = { status: 'success' }

      revalidatePath(`/users/profile/${contactUserId}`)
    }
  }

  return resultObject
}
