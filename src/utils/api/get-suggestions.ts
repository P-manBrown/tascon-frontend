import 'server-only'
import camelcaseKeys from 'camelcase-keys'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { z } from 'zod'
import { userSchema } from '@/schemas/response/user'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.object({
  users: z.array(
    userSchema.shape.user.omit({ contact: true, is_suggested: true }),
  ),
})

const paginationDataSchema = z.object({
  currentPage: z.coerce.number().int().positive(),
  pageItems: z.coerce.number().int().nonnegative(),
  totalPages: z.coerce.number().int().positive(),
  totalCount: z.coerce.number().int().nonnegative(),
})

export const getSuggestions = cache(async (page: string) => {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/users/suggestions?page=${page}`,
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

  const { users } = camelcaseKeys(validateDataResult, { deep: true })

  const paginationData = {
    currentPage: headers.get('current-page'),
    pageItems: headers.get('page-items'),
    totalPages: headers.get('total-pages'),
    totalCount: headers.get('total-count'),
  }

  const validatePaginationResult = validateData({
    requestId,
    dataSchema: paginationDataSchema,
    data: paginationData,
  })

  if (validatePaginationResult instanceof Error) {
    throw validatePaginationResult
  }

  return {
    users,
    pagination: validatePaginationResult,
  }
})
