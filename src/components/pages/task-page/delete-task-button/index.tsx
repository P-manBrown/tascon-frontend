'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { IconMessage } from '@/components/icon-message'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { useQueryParams } from '@/utils/query-param/use-query-params'
import { getSafeRedirectUrl } from '@/utils/url/get-safe-redirect-url'
import { deleteTask } from './delete-task.api'

type Props = {
  id: string
}

export function DeleteTaskButton({ id }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromUrlRef = useRef(searchParams.get('from_url'))
  const { cleanupQueryParams } = useQueryParams({ searchParams })
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
      const result = await deleteTask({ taskId: id })
      if (result.status === 'error') {
        if (result.name === 'HttpError' && result.statusCode === 401) {
          router.push(redirectLoginPath)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        // Notify calendar to remove deleted task from events
        window.dispatchEvent(new CustomEvent('task-deleted'))

        const targetUrl = getSafeRedirectUrl(fromUrlRef.current, '/tasks')
        router.replace(targetUrl)
      }
    })
  }

  const handleClose = (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    ev.stopPropagation()
    unmountModal()
  }

  useEffect(() => {
    cleanupQueryParams(['from_url'])
  }, [cleanupQueryParams])

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
                本当にこのタスクを削除しますか？
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
