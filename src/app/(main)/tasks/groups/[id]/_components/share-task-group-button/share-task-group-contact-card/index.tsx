"use client";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useTransition } from "react";
import { useErrorSnackbar } from "@/app/_components/snackbars/snackbar/use-error-snackbar";
import { Button } from "@/components/buttons/button";
import { IconButton } from "@/components/buttons/icon-button";
import { ContactNote } from "@/components/cards/contact-cards/contact-note";
import { UserCard } from "@/components/cards/user-card";
import { ModalContent } from "@/components/contents/modal-content";
import { IconMessage } from "@/components/icon-message";
import { Modal } from "@/components/modal";
import { useModal } from "@/components/modal/use-modal";
import { createTaskGroupShare } from "../create-task-group-share.api";

type Props = {
  contactUser: {
    id: number;
    name: string;
    bio?: string;
    avatarUrl?: string;
  };
  displayName?: string;
  note?: string;
  taskGroupId: string;
  taskGroupName: string;
  isShared: boolean;
};

export function ShareTaskGroupContactCard({
  contactUser,
  displayName,
  note,
  taskGroupId,
  taskGroupName,
  isShared,
}: Props) {
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
  const userName =
    displayName === undefined || displayName === ""
      ? contactUser.name
      : displayName;

  const handleShareClick = () => {
    closeModal();
    startTransition(async () => {
      const result = await createTaskGroupShare({
        taskGroupId: Number(taskGroupId),
        userId: contactUser.id,
      });

      if (result.status === "error") {
        openErrorSnackbar(result);
      }
    });
  };

  const handleClose = (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    ev.stopPropagation();
    unmountModal();
  };

  return (
    <UserCard
      id={contactUser.id}
      name={userName}
      bio={contactUser.bio}
      avatarUrl={contactUser.avatarUrl}
    >
      <ContactNote note={note} />
      <div className="relative z-10 mt-4">
        {isShared ? (
          <div className="flex items-center gap-1 font-bold text-green-700">
            <CheckIcon className="size-5" />
            <span>共有済み</span>
          </div>
        ) : (
          <Button
            type="button"
            className="btn-primary"
            status={isPending ? "pending" : "idle"}
            onClick={openModal}
          >
            共有
          </Button>
        )}
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
                  {taskGroupName} を {contactUser.name} と共有しますか？
                </p>
                <div className="flex items-center justify-center gap-5">
                  <Button
                    type="button"
                    className="btn-primary"
                    status={isPending ? "disabled" : "idle"}
                    onClick={handleShareClick}
                  >
                    共有
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
      </div>
    </UserCard>
  );
}
