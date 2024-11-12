'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { useId } from 'react'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Label } from '@/components/form-controls/label'
import { TextField } from '@/components/form-controls/text-field'
import { Modal } from '@/components/modal'
import { VisibilityToggleIcon } from '@/components/visibility-toggle-icon'
import { useVisibilityToggle } from '@/components/visibility-toggle-icon/use-visibility-toggle'
import { SignUpSuccessMessage } from './sign-up-success-message'
import { useSignUpForm } from './use-sign-up-form'
import type { LabeledTextFields } from '@/types/labeled-text-fields'

export function SignUpForm() {
  const id = useId()
  const { isVisible, toggleVisible } = useVisibilityToggle()

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
    onSubmit,
    handleSubmit,
    register,
  } = useSignUpForm()

  const labeledTextFields: LabeledTextFields = [
    {
      id: `${id}-name`,
      label: 'ユーザー名',
      type: 'text',
      autoComplete: 'username',
      register: register('name'),
      errors: errors.name,
    },
    {
      id: `${id}-email`,
      label: 'メールアドレス',
      type: 'email',
      autoComplete: 'email',
      register: register('email'),
      errors: errors.email,
    },
    {
      id: `${id}-password`,
      label: 'パスワード',
      type: isVisible ? 'text' : 'password',
      autoComplete: 'new-password',
      register: register('password'),
      errors: errors.password,
      suffixIcon: (
        <IconButton
          type="button"
          aria-label={isVisible ? 'パスワードを隠す' : 'パスワードを表示する'}
          onClick={toggleVisible}
        >
          <VisibilityToggleIcon isVisible={isVisible} className="size-5" />
        </IconButton>
      ),
    },
  ]

  return (
    <>
      <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3">
          {labeledTextFields.map((labeledTextField) => (
            <div key={labeledTextField.id}>
              <Label htmlFor={labeledTextField.id}>
                {labeledTextField.label}
              </Label>
              <TextField
                id={labeledTextField.id}
                type={labeledTextField.type}
                autoComplete={labeledTextField.autoComplete}
                readOnly={isSubmitting}
                register={labeledTextField.register}
                errors={labeledTextField.errors}
                suffixIcon={labeledTextField.suffixIcon}
              />
            </div>
          ))}
        </div>
        <Button
          type="submit"
          className="btn-primary mt-6"
          status={isSubmitting ? 'pending' : 'idle'}
        >
          新規登録
        </Button>
      </form>
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
            <SignUpSuccessMessage email={email} />
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
