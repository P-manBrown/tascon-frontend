import "server-only";
import camelcaseKeys from "camelcase-keys";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { taskGroupShareSchema } from "@/schemas/response/task-group-share";
import { fetchData } from "@/utils/api/fetch-data";
import { getBearerToken } from "@/utils/cookie/bearer-token";
import { HttpError } from "@/utils/error/custom/http-error";
import { generateRedirectLoginPath } from "@/utils/login-path/generate-redirect-login-path.server";
import { getRequestId } from "@/utils/request-id/get-request-id";
import { validateData } from "@/utils/validation/validate-data";

const dataSchema = z.object({
  task_group_shares: z.array(taskGroupShareSchema),
});

export const getTaskGroupShares = cache(async () => {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/task_group_shares`,
    {
      method: "GET",
      headers: {
        Authorization: await getBearerToken(),
      },
    },
  );

  if (fetchDataResult instanceof Error) {
    const isHttpError = fetchDataResult instanceof HttpError;
    const isUnauthorized = isHttpError && fetchDataResult.statusCode === 401;

    if (isUnauthorized) {
      const redirectLoginPath = await generateRedirectLoginPath();
      redirect(redirectLoginPath);
    }

    throw fetchDataResult;
  }

  const { headers, data } = fetchDataResult;
  const requestId = getRequestId(headers);

  const validateDataResult = validateData({ requestId, dataSchema, data });

  if (validateDataResult instanceof Error) {
    throw validateDataResult;
  }

  const camelcaseData = camelcaseKeys(validateDataResult, { deep: true });

  return camelcaseData;
});
