'use server'

import camelcaseKeys from 'camelcase-keys'
import { revalidatePath } from 'next/cache'
import snakecaseKeys from 'snakecase-keys'
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
  taskGroupId: string
  bodyData: {
    note: string
  }
}

type Data = CamelCaseKeys<z.infer<typeof taskGroupSchema>, false>

export async function changeTaskGroupNote({ taskGroupId, bodyData }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/task_groups/${taskGroupId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getBearerToken(),
      },
      body: JSON.stringify(snakecaseKeys(bodyData, { deep: false })),
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
      revalidatePath(`/tasks/groups/${taskGroupId}`)
    }
  }

  return resultObject
}
