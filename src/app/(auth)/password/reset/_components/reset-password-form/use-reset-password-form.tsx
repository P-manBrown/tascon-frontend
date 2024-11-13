import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useModal } from '@/components/modal/use-modal'
import { resetPasswordSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { resetPassword } from './reset-password.api'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function useResetPasswordForm() {
  const [resultValues, setResultValues] = useState({
    email: '',
    message: '',
  })
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
  } = useForm<ResetPasswordFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(resetPasswordSchema),
  })

  const handleHttpError = useCallback(
    (err: ErrorObject<HttpError>) => {
      if (err.message.startsWith('メールアドレス')) {
        setError(
          'email',
          {
            type: err.status.toString(),
            message: err.message,
          },
          { shouldFocus: true },
        )
      } else {
        openErrorSnackbar(err)
      }
    },
    [openErrorSnackbar, setError],
  )

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = useCallback(
    async (data) => {
      const result = await resetPassword(data)
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        reset()
        setResultValues({
          email: result.email,
          message: result.message,
        })
        openModal()
      }
    },
    [handleHttpError, openErrorSnackbar, openModal, reset],
  )

  return {
    shouldMount,
    isOpen,
    openModal,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
    resultValues,
    isSubmitting,
    errors,
    register,
    handleSubmit,
    onSubmit,
  }
}
