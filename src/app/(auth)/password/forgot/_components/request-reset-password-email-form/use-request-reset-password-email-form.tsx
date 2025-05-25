import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useModal } from '@/components/modal/use-modal'
import { requestResetPasswordEmailSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { requestResetPasswordEmail } from '@/utils/api/request-reset-password-email'
import { HttpError } from '@/utils/error/custom/http-error'
import { isValidValue } from '@/utils/type-guard/is-valid-data'
import type { SubmitHandler } from 'react-hook-form'

type ResetPasswordFormValues = z.infer<typeof requestResetPasswordEmailSchema>

const snackbarErrorsSchema = z.object({
  success: z.literal(false),
  errors: z.array(z.string()),
})

export function useRequestResetPasswordEmailForm() {
  const [email, setEmail] = useState('')
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
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(requestResetPasswordEmailSchema),
  })

  const handleHttpError = useCallback(
    (err: ErrorObject<HttpError>) => {
      if (isValidValue(snackbarErrorsSchema, err.data)) {
        openErrorSnackbar(err, err.data.errors[0])
      } else {
        openErrorSnackbar(err)
      }
    },
    [openErrorSnackbar],
  )

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = useCallback(
    async (data) => {
      const result = await requestResetPasswordEmail(data)
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        reset()
        setEmail(data.email)
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
    email,
    isSubmitting,
    errors,
    register,
    handleSubmit,
    onSubmit,
  }
}
