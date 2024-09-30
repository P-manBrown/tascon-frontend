'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { ModalContent } from '@/components/contents/modal-content'
import { Modal } from '@/components/modal'
import { useModal } from '@/components/modal/use-modal'
import { changePasswordSchema } from '@/schemas/request/auth'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { ChangePasswordSuccessMessage } from './change-password-success-message'
import { changePassword } from './change-password.api'
import { CurrentPasswordInput } from './current-password-input'
import { NewPasswordInput } from './new-password-input'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

type ChangePasswordFormValues = {
  currentPassword?: z.infer<typeof changePasswordSchema>['currentPassword']
  password: z.infer<typeof changePasswordSchema>['password']
}

type Props = {
  allowPasswordChange: boolean
  nameInput: React.ReactElement
  emailInput: React.ReactElement
  csrfToken: string
}

export function ChangePasswordForm({
  allowPasswordChange,
  nameInput,
  emailInput,
  csrfToken,
}: Props) {
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
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
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<ChangePasswordFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(
      allowPasswordChange
        ? changePasswordSchema.omit({ currentPassword: true })
        : changePasswordSchema,
    ),
  })

  const handleHttpError = (result: HttpError) => {
    if (result.status === 401) {
      router.replace(redirectLoginPath)
    } else if (result.message.startsWith('現在のパスワード')) {
      setError(
        'currentPassword',
        {
          type: result.status.toString(),
          message: result.message,
        },
        { shouldFocus: true },
      )
    } else {
      // @ts-expect-error
      openErrorSnackbar(result)
    }
  }

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
    const result = await changePassword({ csrfToken, ...data })
    if (result instanceof Error) {
      if (result instanceof HttpError) {
        handleHttpError(result)
      } else {
        // @ts-expect-error
        openErrorSnackbar(result)
      }
    } else {
      reset()
      openModal()
      if (allowPasswordChange) {
        router.refresh()
      }
    }
  }

  return (
    <>
      <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-3">
          {nameInput}
          {emailInput}
          {!allowPasswordChange && (
            <CurrentPasswordInput
              readOnly={isSubmitting}
              register={register('currentPassword')}
              errors={errors.currentPassword}
            />
          )}
          <NewPasswordInput
            readOnly={isSubmitting}
            register={register('password')}
            errors={errors.password}
          />
        </div>
        <Button
          type="submit"
          className="btn-primary mt-9"
          status={isSubmitting ? 'pending' : 'idle'}
        >
          パスワード変更
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
            <ChangePasswordSuccessMessage />
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
