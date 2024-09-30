import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useModal } from '@/components/modal/use-modal'
import { signUpSchema } from '@/schemas/request/auth'
import { signUp } from './sign-up.api'
import type { ErrorObject } from '@/types/error'
import type { HttpError } from '@/utils/error/custom/http-error'
import type { z } from 'zod'

type SignUpFormValues = z.infer<typeof signUpSchema>

type Params = {
  csrfToken: string
}

export function useSignUpForm({ csrfToken }: Params) {
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
    setError,
    formState: { isSubmitting, errors },
  } = useForm<SignUpFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(signUpSchema),
  })

  const handleHttpError = useCallback(
    (err: ErrorObject<HttpError>) => {
      if (err.message.startsWith('メールアドレス')) {
        setError(
          'email',
          {
            type: err.statusCode.toString(),
            message: err.message,
          },
          { shouldFocus: true },
        )
      } else {
        openErrorSnackbar(err)
      }
    },
    [setError, openErrorSnackbar],
  )

  const onSubmit: SubmitHandler<SignUpFormValues> = useCallback(
    async (data) => {
      const result = await signUp({ csrfToken, ...data })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        }
      } else {
        reset()
        setEmail(result.data.email)
        openModal()
      }
    },
    [csrfToken, reset, openModal, handleHttpError],
  )

  return {
    email,
    shouldMount,
    isOpen,
    closeModal,
    unmountModal,
    handleAnimationEnd,
    handleCancel,
    register,
    handleSubmit,
    isSubmitting,
    errors,
    onSubmit,
  }
}
