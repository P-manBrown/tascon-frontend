'use server'

import camelcaseKeys from 'camelcase-keys'
import { revalidatePath } from 'next/cache'
import { contactSchema } from '@/schemas/response/contacts'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'
import type { z } from 'zod'

type Params = {
  currentUserId: string
  contactUserId: number
}

type Data = CamelCaseKeys<z.infer<typeof contactSchema>, true>

export async function createContactFromSuggestion({
  currentUserId,
  contactUserId,
}: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/users/${currentUserId}/contacts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getBearerToken(),
      },
      body: JSON.stringify({
        contact_user_id: contactUserId,
        display_name: '',
        note: '',
      }),
    },
  )

  let resultObject: ResultObject<Data>

  if (fetchDataResult instanceof Error) {
    resultObject = createErrorObject(fetchDataResult)
  } else {
    const { headers, data } = fetchDataResult
    const requestId = getRequestId(headers)
    const validateDataResult = validateData({
      requestId,
      dataSchema: contactSchema,
      data,
    })

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult)
    } else {
      resultObject = {
        status: 'success',
        ...camelcaseKeys(validateDataResult, { deep: true }),
      }
      revalidatePath('/users/suggestions')
      revalidatePath(`/users/profile/${contactUserId}`)
    }
  }

  return resultObject
}
