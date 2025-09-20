'use server'

import camelcaseKeys from 'camelcase-keys'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'

const dataSchema = z.object({
  block: z.object({
    id: z.number(),
    blocked: z.object({
      id: z.number(),
      name: z.string(),
      bio: z.string().optional(),
      avatar_url: z.string().optional(),
    }),
  }),
})

type Data = CamelCaseKeys<z.infer<typeof dataSchema>, true>

type Params = {
  currentUserId: string
  userId: number
}

export async function createBlock({ currentUserId, userId }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/users/${currentUserId}/blocks`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getBearerToken(),
      },
      body: JSON.stringify({ blocked_id: userId }),
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
      revalidatePath(`/users/profile/${userId}`)
    }
  }

  return resultObject
}
