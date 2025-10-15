'use client'

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'
import { CreateTaskGroupForm } from './create-task-group-form'

export function CreateTaskGroupButton() {
  const {
    shouldMount,
    isOpen,
    openModal,
    closeModal,
    handleAnimationEnd,
    handleCancel,
  } = useModal()

  return (
    <>
      <IconButton
        type="button"
        onClick={openModal}
        aria-label="タスクグループ追加モーダルを表示"
      >
        <PlusIcon className="size-5 stroke-black" />
      </IconButton>
      {shouldMount && (
        <Modal
          isOpen={isOpen}
          onAnimationEnd={handleAnimationEnd}
          onCancel={handleCancel}
          onBackdropClick={handleCancel}
        >
          <ModalContent
            className="md:min-w-xl"
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
            <h2 className="text-center text-xl font-bold">
              タスクグループ追加
            </h2>
            <div className="mt-8 space-y-6">
              <p className="text-sm">
                グループ名とアイコンを入力してください。
              </p>
              <CreateTaskGroupForm handleSubmitSuccess={closeModal} />
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
