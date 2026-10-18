"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { z } from "zod";
import { useErrorSnackbar } from "@/app/_components/snackbars/snackbar/use-error-snackbar";
import { Button } from "@/components/buttons/button";
import type { ErrorObject } from "@/types/error";
import type { HttpError } from "@/utils/error/custom/http-error";
import { useRedirectLoginPath } from "@/utils/login-path/use-redirect-login-path";
import { isValidValue } from "@/utils/type-guard/is-valid-value";
import { cancelHandoverRequest } from "../cancel-handover-request.api";

const errorObjectSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
});
const errorsObjectSchema = z.object({
  errors: z.array(errorObjectSchema.shape.error),
});
const snackbarErrorSchema = z.union([errorObjectSchema, errorsObjectSchema]);

type Props = {
  shareId: number;
  taskGroupId: string;
};

export function CancelHandoverRequestButton({ shareId, taskGroupId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectLoginPath = useRedirectLoginPath({ searchParams });
  const [isPending, startTransition] = useTransition();
  const { openErrorSnackbar } = useErrorSnackbar();

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    const { data } = err;
    if (err.statusCode === 401) {
      router.push(redirectLoginPath);
    } else if (!isValidValue(snackbarErrorSchema, data)) {
      openErrorSnackbar(err);
    } else if ("error" in data) {
      openErrorSnackbar(err, data.error.message);
    } else {
      openErrorSnackbar(err, data.errors[0].message);
    }
  };

  const handleClick = () => {
    startTransition(async () => {
      const result = await cancelHandoverRequest({ shareId, taskGroupId });

      if (result.status === "error") {
        if (result.name === "HttpError") {
          handleHttpError(result);
        } else {
          openErrorSnackbar(result);
        }
      }
    });
  };

  return (
    <Button
      type="button"
      className="btn-danger"
      status={isPending ? "pending" : "idle"}
      onClick={handleClick}
    >
      引き継ぎ依頼を取り消す
    </Button>
  );
}
