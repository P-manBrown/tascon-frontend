'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'

type Props = Pick<React.ComponentProps<typeof ModalContent>, 'children'>

export function UserModal({ children }: Props) {
  const router = useRouter()
  const { isOpen, closeModal, handleAnimationEnd, handleCancel } = useModal({
    initialIsOpen: true,
  })

  return (
    <Modal
      isOpen={isOpen}
      onAnimationEnd={handleAnimationEnd}
      onCancel={handleCancel}
      onClose={router.back}
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
        {children}
      </ModalContent>
    </Modal>
  )
}
