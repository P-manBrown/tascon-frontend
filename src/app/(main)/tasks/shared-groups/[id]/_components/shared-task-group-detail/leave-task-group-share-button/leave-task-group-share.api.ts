"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ErrorObject, Errors } from "@/types/error";
import { fetchData } from "@/utils/api/fetch-data";
import { getBearerToken } from "@/utils/cookie/bearer-token";
import { createErrorObject } from "@/utils/error/create-error-object";
import { getRequestId } from "@/utils/request-id/get-request-id";
import { validateData } from "@/utils/validation/validate-data";

const dataSchema = z.null();

type Params = {
  shareId: string;
};

export async function leaveTaskGroupShare({ shareId }: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/task_group_shares/${shareId}`,
    {
      method: "DELETE",
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

    const validateDataResult = validateData({ requestId, dataSchema, data });

    if (validateDataResult instanceof Error) {
      errorObject = createErrorObject(validateDataResult);
    } else {
      revalidatePath("/tasks", "layout");
      redirect("/tasks");
    }
  }

  return errorObject;
}
