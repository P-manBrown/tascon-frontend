import 'server-only'
import camelcaseKeys from 'camelcase-keys'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { z } from 'zod'
import { paginationDataSchema } from '@/schemas/response/pagination'
import { taskSchema } from '@/schemas/response/tasks'
import { fetchData } from '@/utils/api/fetch-data'
import { getBearerToken } from '@/utils/cookie/bearer-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { extractPaginationData } from '@/utils/header/extract-pagination-data'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { getRequestId } from '@/utils/request-id/get-request-id'
import { validateData } from '@/utils/validation/validate-data'

const dataSchema = z.object({
  tasks: z.array(taskSchema.shape.task),
})

type Params = {
  page: string
  limit: string
  filter?: 'actionable'
  taskGroupId?: string
}

export const getTasks = cache(
  async ({ page, limit, filter, taskGroupId }: Params) => {
    const queryParams = new URLSearchParams({ page })
    queryParams.append('limit', limit)
    if (filter !== undefined) {
      queryParams.append('filter', filter)
    }
    if (taskGroupId !== undefined) {
      queryParams.append('task_group_id', taskGroupId)
    }

    const fetchDataResult = await fetchData(
      `${process.env.API_ORIGIN}/api/v1/tasks?${queryParams}`,
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
    const { tasks } = camelcaseKeys(validateDataResult, { deep: true })

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
      tasks,
      pagination: validatePaginationResult,
    }
  },
)
