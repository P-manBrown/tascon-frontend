'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { IconMessage } from '@/components/icon-message'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { deleteTaskGroup } from './delete-task-group.api'

type Props = {
  taskGroupId: string
}

export function DeleteTaskGroupButton({ taskGroupId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const [isPending, startTransition] = useTransition()
  const { openErrorSnackbar } = useErrorSnackbar()
  const {
    shouldMount,
    isOpen,
    openModal,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
  } = useModal()

  const handleOkClick = () => {
    closeModal()
    startTransition(async () => {
      const result = await deleteTaskGroup({ taskGroupId })
      if (result.status === 'error') {
        if (result.name === 'HttpError' && result.statusCode === 401) {
          router.push(redirectLoginPath)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        router.replace('/tasks')
      }
    })
  }

  const handleClose = (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    ev.stopPropagation()
    unmountModal()
  }

  return (
    <>
      <Button
        type="button"
        className="btn-danger"
        status={isPending ? 'pending' : 'idle'}
        onClick={openModal}
      >
        削除
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
                本当にこのタスクグループを削除しますか？
                <br />
                削除すると、タスクグループ内のすべてのタスクも削除されます。
              </p>
              <div className="mx-2.5 flex items-center justify-center gap-5">
                <Button
                  type="button"
                  className="btn-danger"
                  status={isPending ? 'disabled' : 'idle'}
                  onClick={handleOkClick}
                >
                  削除
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
  )
}
