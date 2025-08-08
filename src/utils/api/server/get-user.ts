import 'server-only'
import camelcaseKeys from 'camelcase-keys'
import { cache } from 'react'
import { z } from 'zod'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { getRequestId } from '../../request-id/get-request-id'
import { validateData } from '../../validation/validate-data'
import { fetchData } from '../fetch-data'

const dataSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    bio: z.string().optional(),
    avatar_url: z.string().optional(),
    current_user_contact: z
      .object({
        id: z.number(),
        display_name: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
  }),
})

export const getUser = cache(async (id: string) => {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/users/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: await getBearerToken(),
      },
    },
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
})
