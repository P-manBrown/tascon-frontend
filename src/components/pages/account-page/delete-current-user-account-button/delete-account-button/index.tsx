'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { IconMessage } from '@/components/icon-message'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'
import { cleanupLocalStorage } from './cleanup-local-storage'
import { deleteAccount } from './delete-account.api'

type Props = {
  currentUserId: string
  csrfToken: string
}

export function DeleteAccountButton({ currentUserId, csrfToken }: Props) {
  const router = useRouter()
  const id = useId()
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
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

  const handleOkClick = async () => {
    setIsDeletingAccount(true)
    const result = await deleteAccount(csrfToken)
    if (result.status === 'error') {
      openErrorSnackbar(result)
    } else {
      cleanupLocalStorage(currentUserId)
      closeModal()
      window.open('https://forms.gle/F9d8j2XnjT2mAfRc9', '_blank', 'noreferrer')
      router.push('/')
      router.refresh()
    }
    setIsDeletingAccount(false)
  }

  const handleClose = (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    ev.stopPropagation()
    unmountModal()
  }

  return (
    <>
      <Button type="button" className="btn-danger" onClick={openModal}>
        退会
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
              <p className="mb-5 text-center">本当に退会しますか？</p>
              <div className="mx-2.5 flex min-w-[16rem] items-center justify-center gap-5">
                {/* 'id' is used to manage popstate events in AccountModal. */}
                <Button
                  id={`${id}-confirm-delete-account-button`}
                  type="button"
                  className="btn-danger"
                  status={isDeletingAccount ? 'pending' : 'idle'}
                  onClick={handleOkClick}
                >
                  退会
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
