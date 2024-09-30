import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useModal } from '@/components/modal/use-modal'
import { resetPasswordSchema } from '@/schemas/request/auth'
import { HttpError } from '@/utils/error/custom/http-error'
import { resetPassword } from './reset-password.api'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
type UseResetPasswordFormParams = {
  csrfToken: string
}

export function useResetPasswordForm({
  csrfToken,
}: UseResetPasswordFormParams) {
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
    (err: HttpError) => {
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
        // @ts-expect-error
        openErrorSnackbar(err)
      }
    },
    [openErrorSnackbar, setError],
  )

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = useCallback(
    async (data) => {
      const result = await resetPassword({ csrfToken, ...data })
      if (result instanceof Error) {
        if (result instanceof HttpError) {
          handleHttpError(result)
        } else {
          // @ts-expect-error
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
    [handleHttpError, openErrorSnackbar, openModal, reset, csrfToken],
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
