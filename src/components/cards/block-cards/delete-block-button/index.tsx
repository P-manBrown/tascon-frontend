'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { IconMessage } from '@/components/icon-message'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { deleteBlock } from './delete-block.api'

type Props = {
  blockId: number
}

export function DeleteBlockButton({ blockId }: Props) {
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
      const result = await deleteBlock({ blockId })

      if (result.status === 'error') {
        if (result.name === 'HttpError' && result.statusCode === 401) {
          router.push(redirectLoginPath)
        } else {
          openErrorSnackbar(result)
        }
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
        解除
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
              <p className="mb-5 text-center">本当にブロックを解除しますか？</p>
              <div className="flex items-center justify-center gap-5">
                <Button
                  type="button"
                  className="btn-danger"
                  status={isPending ? 'disabled' : 'idle'}
                  onClick={handleOkClick}
                >
                  解除
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
