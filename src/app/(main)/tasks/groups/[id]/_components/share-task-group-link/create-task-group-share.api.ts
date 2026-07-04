"use server";

import type { CamelCaseKeys } from "camelcase-keys";
import camelcaseKeys from "camelcase-keys";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { taskGroupShareSchema } from "@/schemas/response/task-group-share";
import type { ResultObject } from "@/types/api";
import { fetchData } from "@/utils/api/fetch-data";
import { getBearerToken } from "@/utils/cookie/bearer-token";
import { createErrorObject } from "@/utils/error/create-error-object";
import { getRequestId } from "@/utils/request-id/get-request-id";
import { validateData } from "@/utils/validation/validate-data";

type Data = CamelCaseKeys<z.infer<typeof taskGroupShareSchema>, true>;

type Params = {
  taskGroupId: number;
  userId: number;
};

export async function createTaskGroupShare({ taskGroupId, userId }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/task_group_shares`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: await getBearerToken(),
      },
      body: JSON.stringify({
        task_group_id: taskGroupId,
        user_id: userId,
      }),
    },
  );

  let resultObject: ResultObject<Data>;

  if (fetchDataResult instanceof Error) {
    resultObject = createErrorObject(fetchDataResult);
  } else {
    const { headers, data } = fetchDataResult;
    const requestId = getRequestId(headers);

    const validateDataResult = validateData({
      requestId,
      dataSchema: taskGroupShareSchema,
      data,
    });

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult);
    } else {
      resultObject = {
        status: "success",
        ...camelcaseKeys(validateDataResult, { deep: true }),
      };

      revalidatePath(`/tasks/groups/${taskGroupId}/share`);
    }
  }

  return resultObject;
}
