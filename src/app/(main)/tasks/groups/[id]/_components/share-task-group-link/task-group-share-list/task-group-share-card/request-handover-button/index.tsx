"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
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
import { requestHandover } from "../request-handover.api";

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
  disabled: boolean;
  shareId: number;
  taskGroupId: string;
  userName: string;
};

export function RequestHandoverButton({
  shareId,
  taskGroupId,
  userName,
  disabled,
}: Props) {
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
      const result = await requestHandover({ shareId, taskGroupId });

      if (result.status === "error") {
        if (result.name === "HttpError") {
          handleHttpError(result);
        } else {
          openErrorSnackbar(result);
        }
      } else {
        closeModal();
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
        className="btn-primary"
        status={isPending ? "pending" : disabled ? "disabled" : "idle"}
        onClick={openModal}
      >
        引き継ぎ依頼
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
              <p className="mb-5 text-center">
                {userName}さんに、このタスクグループの引き継ぎを依頼しますか？
              </p>
              <div className="flex items-center justify-center gap-5">
                <Button
                  type="button"
                  className="btn-primary"
                  status={isPending ? "pending" : "idle"}
                  onClick={handleOkClick}
                >
                  依頼する
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
