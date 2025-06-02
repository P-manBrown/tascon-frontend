import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useModal } from '@/components/modal/use-modal'
import { signUpSchema } from '@/schemas/request/auth'
import { createFormErrorsSchema } from '@/utils/form/create-form-errors-schema'
import { useHandleFormErrors } from '@/utils/form/use-handle-form-error'
import { isValidValue } from '@/utils/type-guard/is-valid-value'
import { signUp } from './sign-up.api'
import type { ErrorObject } from '@/types/error'
import type { HttpError } from '@/utils/error/custom/http-error'
import type { SubmitHandler } from 'react-hook-form'

type SignUpFormValues = z.infer<typeof signUpSchema>
const formErrorsSchema = createFormErrorsSchema(
  z.enum(['email', 'password', 'name']),
)

export function useSignUpForm() {
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
  const { handleFormErrors } = useHandleFormErrors(setError)

  const handleHttpError = useCallback(
    (err: ErrorObject<HttpError>) => {
      const { data } = err
      if (isValidValue(formErrorsSchema, data)) {
        handleFormErrors(data)
      } else {
        openErrorSnackbar(err)
      }
    },
    [handleFormErrors, openErrorSnackbar],
  )

  const onSubmit: SubmitHandler<SignUpFormValues> = useCallback(
    async (data) => {
      const result = await signUp(data)
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        }
      } else {
        reset()
        setEmail(result.account.email)
        openModal()
      }
    },
    [reset, openModal, handleHttpError],
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
