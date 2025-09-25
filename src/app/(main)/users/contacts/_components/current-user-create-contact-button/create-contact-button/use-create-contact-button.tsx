import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useModal } from '@/components/modal/use-modal'
import { signUpSchema } from '@/schemas/request/auth'
import { createContact } from '@/utils/api/create-contact'
import { createFormErrorsSchema } from '@/utils/form/create-form-errors-schema'
import { useHandleFormErrors } from '@/utils/form/use-handle-form-error'
import { isValidValue } from '@/utils/type-guard/is-valid-value'
import type { ErrorObject } from '@/types/error'
import type { HttpError } from '@/utils/error/custom/http-error'
import type { SubmitHandler } from 'react-hook-form'

const createContactSchema = signUpSchema.pick({ email: true })
type CreateContactFormValues = z.infer<typeof createContactSchema>

const formErrorsSchema = createFormErrorsSchema(z.enum(['email']))
const snackbarErrorsSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
    }),
  ),
})

type Params = {
  currentUserId: string
}

export function useCreateContactButton({ currentUserId }: Params) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
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
    formState: { errors },
  } = useForm<CreateContactFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(createContactSchema),
  })

  const { handleFormErrors } = useHandleFormErrors(setError)

  const handleClose = useCallback(
    (ev: React.SyntheticEvent<HTMLDialogElement, Event>) => {
      ev.stopPropagation()
      unmountModal()
    },
    [unmountModal],
  )

  const handleHttpError = useCallback(
    (err: ErrorObject<HttpError>) => {
      const { data } = err
      if (isValidValue(formErrorsSchema, data)) {
        handleFormErrors(data)
      } else if (isValidValue(snackbarErrorsSchema, data)) {
        openErrorSnackbar(err, data.errors[0].message)
      } else {
        openErrorSnackbar(err)
      }
    },
    [handleFormErrors, openErrorSnackbar],
  )

  const onSubmit: SubmitHandler<CreateContactFormValues> = useCallback(
    (data) => {
      startTransition(async () => {
        const result = await createContact({ currentUserId, ...data })
        if (result.status === 'error') {
          if (result.name === 'HttpError') {
            handleHttpError(result)
          }
        } else {
          reset()
          closeModal()
          router.push(`/users/profile/${result.contact.contactUser.id}`)
        }
      })
    },
    [currentUserId, reset, router, handleHttpError, closeModal],
  )

  return {
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
  }
}
