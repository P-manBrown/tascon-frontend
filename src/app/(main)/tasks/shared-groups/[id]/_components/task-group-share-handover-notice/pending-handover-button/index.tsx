"use client";

import { BellAlertIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { z } from "zod";
import { useErrorSnackbar } from "@/app/_components/snackbars/snackbar/use-error-snackbar";
import { Button } from "@/components/buttons/button";
import { IconButton } from "@/components/buttons/icon-button";
import { ModalContent } from "@/components/contents/modal-content";
import { IconMessage } from "@/components/icon-message";
import { Modal } from "@/components/modal";
import { useModal } from "@/components/modal/use-modal";
import type { ErrorObject } from "@/types/error";
import type { HttpError } from "@/utils/error/custom/http-error";
import { useRedirectLoginPath } from "@/utils/login-path/use-redirect-login-path";
import { isValidValue } from "@/utils/type-guard/is-valid-value";
import { acceptHandover } from "../accept-handover.api";

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
  shareId: string;
  shapeClasses: string;
};

export function PendingHandoverButton({ shareId, shapeClasses }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectLoginPath = useRedirectLoginPath({ searchParams });
  const [isPending, startTransition] = useTransition();
  const { openErrorSnackbar } = useErrorSnackbar();
  const {
    shouldMount,
    isOpen,
    openModal,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
  } = useModal();

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

  const handleOkClick = () => {
    startTransition(async () => {
      const result = await acceptHandover({ shareId });

      if (result.status === "error") {
        if (result.name === "HttpError") {
          handleHttpError(result);
        } else {
          openErrorSnackbar(result);
        }
      }
    });
  };

  const handleClose = (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    ev.stopPropagation();
    unmountModal();
  };

  return (
    <>
      <Button
        type="button"
        aria-label="引き継ぎ依頼あり"
        className={`btn-primary gap-1 whitespace-nowrap font-medium text-sm ${shapeClasses}`}
        status={isPending ? "pending" : "idle"}
        onClick={openModal}
      >
        <BellAlertIcon className="size-4" />
        <span className="max-sm:hidden">引き継ぎ依頼あり</span>
      </Button>
      {shouldMount && (
        <Modal
          isOpen={isOpen}
          onAnimationEnd={handleAnimationEnd}
          onCancel={handleCancel}
          onClose={handleClose}
          onBackdropClick={closeModal}
        >
          <ModalContent
            upperLeftIcon={
              <IconButton
                type="button"
                aria-label="モーダルを閉じる"
                onClick={closeModal}
              >
                <XMarkIcon className="size-6" />
              </IconButton>
            }
          >
            <IconMessage severity="warning" title="確認">
              <p className="mb-5 sm:text-center">
                この引き継ぎ依頼を承認しますか？
                <br />
                承認すると、タスクグループの所有権が自分に移ります。この操作は取り消せません。
              </p>
              <div className="mx-2.5 flex items-center justify-center gap-5">
                <Button
                  type="button"
                  className="btn-primary"
                  status={isPending ? "disabled" : "idle"}
                  onClick={handleOkClick}
                >
                  承認する
                </Button>
                <Button
                  type="button"
                  className="btn-ghost"
                  onClick={closeModal}
                >
                  キャンセル
                </Button>
              </div>
            </IconMessage>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
