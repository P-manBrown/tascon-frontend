import 'server-only'
import camelcaseKeys from 'camelcase-keys'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { accountSchema } from '@/schemas/response/account'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { getRequestId } from '../../request-id/get-request-id'
import { validateData } from '../../validation/validate-data'
import { fetchData } from '../fetch-data'

export const getCurrentUser = cache(async () => {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/validate_token`,
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

  const validateDataResult = validateData({
    requestId,
    dataSchema: accountSchema,
    data,
  })

  if (validateDataResult instanceof Error) {
    throw validateDataResult
  }

  const camelcaseData = camelcaseKeys(validateDataResult, { deep: true })
  return camelcaseData
})
