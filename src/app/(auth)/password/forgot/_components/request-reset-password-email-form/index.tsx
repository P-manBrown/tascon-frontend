'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useId } from 'react'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Label } from '@/components/form-controls/label'
import { TextField } from '@/components/form-controls/text-field'
import { Modal } from '@/components/modal'
import { RequestResetPasswordEmailSuccessMessage } from './request-reset-password-email-success-message'
import { useRequestResetPasswordEmailForm } from './use-request-reset-password-email-form'

export function RequestResetPasswordEmailForm() {
  const id = useId()
  const {
    shouldMount,
    isOpen,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
    email,
    isSubmitting,
    errors,
    register,
    handleSubmit,
    onSubmit,
  } = useRequestResetPasswordEmailForm()

  return (
    <>
      <div>
        <p className="mb-4">
          登録済みメールアドレスを入力してください。
          <br />
          パスワード再設定用のメールを送信します。
        </p>
        <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
          <Label htmlFor={`${id}-email`}>メールアドレス</Label>
          <TextField
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            readOnly={isSubmitting}
            register={register('email')}
            errors={errors.email}
          />
          <Button
            type="submit"
            className="btn-primary my-7"
            status={isSubmitting ? 'pending' : 'idle'}
          >
            パスワード再設定用メール送信
          </Button>
        </form>
      </div>
      {shouldMount && (
        <Modal
          isOpen={isOpen}
          onCancel={handleCancel}
          onAnimationEnd={handleAnimationEnd}
          onClose={unmountModal}
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
            <RequestResetPasswordEmailSuccessMessage email={email} />
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
