'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Modal } from '@/components/modal'
import { useFormModal } from '@/components/modal/use-form-modal'

// TEMP: https://github.com/vercel/next.js/issues/58123
// TEMP: https://github.com/vercel/next.js/issues/59316

type Props = Pick<React.ComponentProps<typeof ModalContent>, 'children'>

export function CreateTaskModal({ children }: Props) {
  const router = useRouter()
  const {
    isOpen,
    closeModal,
    handleAnimationEnd,
    handleCancel,
    handleBackdropMouseDown,
    handleBackdropClick,
    handleMouseDownCapture,
    handleBlurCapture,
    handleClickCapture,
  } = useFormModal()

  return (
    <Modal
      isOpen={isOpen}
      onAnimationEnd={handleAnimationEnd}
      onCancel={handleCancel}
      onClose={router.back}
      onBackdropMouseDown={handleBackdropMouseDown}
      onBackdropClick={handleBackdropClick}
    >
      <div
        onMouseDownCapture={handleMouseDownCapture}
        onBlurCapture={handleBlurCapture}
        onClickCapture={handleClickCapture}
      >
        <ModalContent
          upperLeftIcon={
            <IconButton
              type="button"
              tabIndex={0}
              aria-label="モーダルを閉じる"
              onClick={closeModal}
            >
              <XMarkIcon className="size-6" />
            </IconButton>
          }
        >
          {children}
        </ModalContent>
      </div>
    </Modal>
  )
}
