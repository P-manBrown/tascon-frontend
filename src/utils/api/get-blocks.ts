import 'server-only'
import camelcaseKeys from 'camelcase-keys'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { z } from 'zod'
import { paginationDataSchema } from '@/schemas/response/pagination'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { extractPaginationData } from '@/utils/header/extract-pagination-data'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.number(),
      blocked: z.object({
        id: z.number(),
        name: z.string(),
        bio: z.string().optional(),
        avatar_url: z.string().optional(),
      }),
    }),
  ),
})

export const getBlocks = cache(async (currentUserId: string, page: string) => {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/users/${currentUserId}/blocks?page=${page}`,
    {
      method: 'GET',
      headers: {
        Authorization: await getBearerToken(),
      },
    },
  )

  if (fetchDataResult instanceof Error) {
    const isHttpError = fetchDataResult instanceof HttpError
    const isUnauthorized = isHttpError && fetchDataResult.statusCode === 401
    if (isUnauthorized) {
      const redirectLoginPath = await generateRedirectLoginPath()
      redirect(redirectLoginPath)
    }

    throw fetchDataResult
  }

  const { headers, data } = fetchDataResult
  const requestId = getRequestId(headers)

  const validateDataResult = validateData({ requestId, dataSchema, data })

  if (validateDataResult instanceof Error) {
    throw validateDataResult
  }

  const { blocks } = camelcaseKeys(validateDataResult, { deep: true })

  const paginationData = extractPaginationData(headers)

  const validatePaginationResult = validateData({
    requestId,
    dataSchema: paginationDataSchema,
    data: paginationData,
  })

  if (validatePaginationResult instanceof Error) {
    throw validatePaginationResult
  }

  return {
    blocks,
    pagination: validatePaginationResult,
  }
})
