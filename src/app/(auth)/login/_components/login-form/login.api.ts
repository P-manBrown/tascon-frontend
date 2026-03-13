"use server";

import type { CamelCaseKeys } from "camelcase-keys";
import camelcaseKeys from "camelcase-keys";
import type { z } from "zod";
import { accountSchema } from "@/schemas/response/account";
import type { ResultObject } from "@/types/api";
import { fetchData } from "@/utils/api/fetch-data";
import { setBearerToken } from "@/utils/cookie/bearer-token";
import { createErrorObject } from "@/utils/error/create-error-object";
import { getRequestId } from "@/utils/request-id/get-request-id";
import { validateData } from "@/utils/validation/validate-data";

type Params = {
  email: string;
  password: string;
};

type Data = CamelCaseKeys<z.infer<typeof accountSchema>, true>;

export async function login(bodyData: Params) {
  const fetchDataResult = await fetchData(
    `${process.env.API_ORIGIN}/api/v1/auth/sign_in`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
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
      dataSchema: accountSchema,
      data,
    });

    if (validateDataResult instanceof Error) {
      resultObject = createErrorObject(validateDataResult);
    } else {
      resultObject = {
        status: "success",
        ...camelcaseKeys(validateDataResult, { deep: true }),
      };
      const bearerToken = headers.get("Authorization");
      const expiry = headers.get("expiry");
      if (bearerToken !== null && expiry !== null) {
        await setBearerToken({ bearerToken, expiry });
      }
    }
  }

  return resultObject;
}
