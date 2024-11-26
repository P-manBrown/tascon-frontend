'use server'

import { z } from 'zod'
import { ResultObject } from '@/types/api'
import { setBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.object({
  bearerToken: z.string(),
  expiry: z.number(),
})

type Params = {
  requestId: string
} & z.infer<typeof dataSchema>

export async function storeCredentials({ requestId, ...data }: Params) {
  let resultObject: ResultObject<{ status: 'success' }>

  const validateDataResult = validateData({
    requestId,
    dataSchema,
    data,
  })

  if (validateDataResult instanceof Error) {
    resultObject = createErrorObject(validateDataResult)
  } else {
    const { bearerToken, expiry } = validateDataResult
    setBearerToken({ bearerToken, expiry })
    resultObject = { status: 'success' }
  }

  return resultObject
}
