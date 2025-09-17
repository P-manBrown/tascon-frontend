import 'server-only'
import camelcaseKeys from 'camelcase-keys'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { z } from 'zod'
import { paginationDataSchema } from '@/schemas/response/pagination'
import { userSchema } from '@/schemas/response/user'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { extractPaginationData } from '@/utils/header/extract-pagination-data'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.object({
  users: z.array(
    userSchema.shape.user.omit({ contact: true, is_suggested: true }),
  ),
})

type Params = {
  page: string
  limit: string
}

export const getSuggestions = cache(async ({ page, limit }: Params) => {
  const queryParams = new URLSearchParams({ page })
  if (limit) queryParams.append('limit', limit.toString())

  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/users/suggestions?${queryParams}`,
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

  const { users: suggestions } = camelcaseKeys(validateDataResult, {
    deep: true,
  })

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
    suggestions,
    pagination: validatePaginationResult,
  }
})
