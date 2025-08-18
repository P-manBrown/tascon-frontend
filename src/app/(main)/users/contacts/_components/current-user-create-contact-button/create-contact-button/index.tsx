'use client'

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Label } from '@/components/form-controls/label'
import { TextField } from '@/components/form-controls/text-field'
import { Modal } from '@/components/modal'
import { useCreateContactButton } from './use-create-contact-button'

type Props = {
  currentUserId: string
  className: string
}

export function CreateContactButton({ currentUserId, className }: Props) {
  const {
    shouldMount,
    isOpen,
    openModal,
    closeModal,
    handleAnimationEnd,
    handleCancel,
    handleClose,
    register,
    handleSubmit,
    errors,
    onSubmit,
    isPending,
  } = useCreateContactButton({ currentUserId })

  return (
    <div>
      <Button
        type="button"
        onClick={openModal}
        className={`btn-success text-sm ${className}`}
      >
        <PlusIcon className="mr-1 size-5 stroke-white" />
        追加
      </Button>
      {shouldMount && (
        <Modal
          isOpen={isOpen}
          onAnimationEnd={handleAnimationEnd}
          onCancel={handleCancel}
          onClose={handleClose}
          onBackdropClick={handleCancel}
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
            <div className="space-y-6">
              <h2 className="text-center text-xl font-bold">ユーザー登録</h2>
              <p className="text-sm">
                登録するユーザーのメールアドレスを入力してください。
              </p>
              <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
                <Label htmlFor="email">メールアドレス</Label>
                <TextField
                  type="email"
                  autoComplete="email"
                  readOnly={isPending}
                  register={register('email')}
                  errors={errors.email}
                />
                <Button
                  type="submit"
                  className="btn-primary mt-6 min-w-24"
                  status={isPending ? 'pending' : 'idle'}
                >
                  登録
                </Button>
              </form>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}
