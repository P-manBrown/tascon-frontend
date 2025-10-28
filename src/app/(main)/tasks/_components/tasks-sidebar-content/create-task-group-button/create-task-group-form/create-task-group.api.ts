'use server'

import camelcaseKeys from 'camelcase-keys'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { taskGroupSchema } from '@/schemas/response/task-group'
import { ResultObject } from '@/types/api'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { createErrorObject } from '@/utils/error/create-error-object'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'
import type { CamelCaseKeys } from 'camelcase-keys'

type Params = {
  name: string
  icon: string
  note?: string
}

type Data = CamelCaseKeys<z.infer<typeof taskGroupSchema>, false>

export async function createTaskGroup(bodyData: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/task_groups`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getBearerToken(),
      },
      body: JSON.stringify(bodyData),
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
      dataSchema: taskGroupSchema,
      data,
    })

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult)
    } else {
      resultObject = {
        status: 'success',
        ...camelcaseKeys(validateDataResult, { deep: false }),
      }

      revalidatePath('/tasks', 'layout')
    }
  }

  return resultObject
}
