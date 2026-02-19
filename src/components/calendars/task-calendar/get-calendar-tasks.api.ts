'use server'

import camelcaseKeys from 'camelcase-keys'
import { z } from 'zod'
import { taskBaseSchema } from '@/schemas/response/task'
import { taskGroupSchema } from '@/schemas/response/task-group'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.object({
  tasks: z.array(
    taskBaseSchema.shape.task.extend({
      starts_at: z.string(),
      ends_at: z.string(),
      task_group: taskGroupSchema.shape.task_group.optional(),
    }),
  ),
})

export async function getCalendarTasks(
  start: string,
  end: string,
  pathname: string,
) {
  const queryParams = new URLSearchParams({ start, end })

  if (pathname === '/tasks/today') {
    queryParams.append('filter', 'actionable')
  } else if (pathname.startsWith('/tasks/groups/')) {
    const groupId = pathname.split('/')[3]

    queryParams.append('task_group_id', groupId)
  }

  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/tasks/calendar?${queryParams}`,
    {
      method: 'GET',
      headers: {
        Authorization: await getBearerToken(),
      },
    },
  )

  if (fetchDataResult instanceof Error) {
    throw fetchDataResult
  }

  const { headers, data } = fetchDataResult
  const requestId = getRequestId(headers)
  const validateDataResult = validateData({
    requestId,
    dataSchema,
    data,
  })

  if (validateDataResult instanceof Error) {
    throw validateDataResult
  }

  const { tasks } = camelcaseKeys(validateDataResult, { deep: true })
  return tasks
}
