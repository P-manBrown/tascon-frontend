"use server";

import camelcaseKeys from "camelcase-keys";
import { z } from "zod";
import { taskBaseSchema } from "@/schemas/response/task";
import { fetchData } from "@/utils/api/fetch-data";
import { getBearerToken } from "@/utils/cookie/bearer-token";
import { getRequestId } from "@/utils/request-id/get-request-id";
import { validateData } from "@/utils/validation/validate-data";

const dataSchema = z.object({
  tasks: z.array(
    taskBaseSchema.shape.task.extend({
      starts_at: z.string(),
      ends_at: z.string(),
    }),
  ),
});

type Params = {
  shareId: string;
  start: string;
  end: string;
};

export async function getSharedCalendarTasks({ shareId, start, end }: Params) {
  const queryParams = new URLSearchParams({ start, end });

  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/task_group_shares/${shareId}/calendar?${queryParams}`,
    {
      method: "GET",
      headers: {
        Authorization: await getBearerToken(),
      },
    },
  );

  if (fetchDataResult instanceof Error) {
    throw fetchDataResult;
  }

  const { headers, data } = fetchDataResult;
  const requestId = getRequestId(headers);
  const validateDataResult = validateData({
    requestId,
    dataSchema,
    data,
  });

  if (validateDataResult instanceof Error) {
    throw validateDataResult;
  }

  const { tasks } = camelcaseKeys(validateDataResult, { deep: true });
  return tasks;
}
