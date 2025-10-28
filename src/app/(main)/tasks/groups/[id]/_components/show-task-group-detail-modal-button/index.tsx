'use client'

import { EllipsisHorizontalIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Modal } from '@/components/modal'
import { useFormModal } from '@/components/modal/use-form-modal'

type Props = {
  modalContent: React.ReactNode
}

export function ShowTaskGroupDetailModalButton({ modalContent }: Props) {
  const {
    shouldMount,
    isOpen,
    openModal,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
    handleBackdropMouseDown,
    handleBackdropClick,
    handleMouseDownCapture,
    handleBlurCapture,
    handleClickCapture,
  } = useFormModal({ initialIsOpen: false })

  return (
    <>
      <IconButton
        type="button"
        aria-label="タスクグループ詳細モーダルを開く"
        onClick={openModal}
      >
        <EllipsisHorizontalIcon className="size-6 fill-black stroke-black" />
      </IconButton>
      {shouldMount && (
        <Modal
          isOpen={isOpen}
          onAnimationEnd={handleAnimationEnd}
          onCancel={handleCancel}
          onClose={unmountModal}
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
                  aria-label="モーダルを閉じる"
                  onClick={closeModal}
                >
                  <XMarkIcon className="size-6" />
                </IconButton>
              }
            >
              {modalContent}
            </ModalContent>
          </div>
        </Modal>
      )}
    </>
  )
}
