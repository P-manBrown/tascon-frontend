"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { taskGroupSchema } from "@/schemas/response/task-group";
import type { ErrorObject, Errors } from "@/types/error";
import { fetchData } from "@/utils/api/fetch-data";
import { getBearerToken } from "@/utils/cookie/bearer-token";
import { createErrorObject } from "@/utils/error/create-error-object";
import { getRequestId } from "@/utils/request-id/get-request-id";
import { validateData } from "@/utils/validation/validate-data";

type Params = {
  shareId: string;
};

export async function acceptHandover({ shareId }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/task_group_shares/${shareId}/accept_handover`,
    {
      method: "PATCH",
      headers: {
        Authorization: await getBearerToken(),
      },
    },
  );

  let errorObject: ErrorObject<Errors>;

  if (fetchDataResult instanceof Error) {
    errorObject = createErrorObject(fetchDataResult);
  } else {
    const { headers, data } = fetchDataResult;
    const requestId = getRequestId(headers);
    const validateDataResult = validateData({
      requestId,
      dataSchema: taskGroupSchema,
      data,
    });

    if (validateDataResult instanceof Error) {
      errorObject = createErrorObject(validateDataResult);
    } else {
      revalidatePath("/tasks", "layout");
      redirect(`/tasks/groups/${validateDataResult.task_group.id}`);
    }
  }

  return errorObject;
}
