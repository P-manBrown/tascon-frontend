import 'server-only'
import camelcaseKeys from 'camelcase-keys'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import { taskGroupSchema } from '@/schemas/response/task-group'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { fetchData } from './fetch-data'
import { getRequestId } from '../request-id/get-request-id'
import { validateData } from '../validation/validate-data'

export const getTaskGroup = cache(async (id: string) => {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/task_groups/${id}`,
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
    const isNotFound = isHttpError && fetchDataResult.statusCode === 404
    if (isUnauthorized) {
      const redirectLoginPath = await generateRedirectLoginPath()
      redirect(redirectLoginPath)
    }
    if (isNotFound) {
      notFound()
    }
    throw fetchDataResult
  }

  const { headers, data } = fetchDataResult
  const requestId = getRequestId(headers)

  const validateDataResult = validateData({
    requestId,
    dataSchema: taskGroupSchema,
    data,
  })
  if (validateDataResult instanceof Error) {
    throw validateDataResult
  }

  const camelcaseData = camelcaseKeys(validateDataResult, { deep: true })
  return camelcaseData
})
