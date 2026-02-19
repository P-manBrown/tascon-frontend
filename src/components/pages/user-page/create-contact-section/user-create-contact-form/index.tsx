'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { Label } from '@/components/form-controls/label'
import { TextField } from '@/components/form-controls/text-field'
import { signUpSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { createContact } from '@/utils/api/create-contact'
import { HttpError } from '@/utils/error/custom/http-error'
import { isValidValue } from '@/utils/type-guard/is-valid-value'

const createContactSchema = signUpSchema.pick({ email: true })
type CreateContactFormValues = z.infer<typeof createContactSchema>

const errorMessageSchema = z.object({
  message: z.string(),
})
const snackbarErrorSchema = z.object({
  error: errorMessageSchema,
})
const snackbarErrorsSchema = z.object({
  errors: z.array(errorMessageSchema),
})

type Props = {
  contactUserId: number
  currentUserId: string
}

export function UserCreateContactForm({ contactUserId, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition()
  const { openErrorSnackbar } = useErrorSnackbar()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateContactFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(createContactSchema),
  })

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    const { data } = err
    if (isValidValue(snackbarErrorSchema, data)) {
      openErrorSnackbar(err, data.error.message)
    } else if (isValidValue(snackbarErrorsSchema, data)) {
      openErrorSnackbar(err, data.errors[0].message)
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit: SubmitHandler<CreateContactFormValues> = (data) => {
    startTransition(async () => {
      const result = await createContact({
        contactUserId,
        currentUserId,
        ...data,
      })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      }
    })
  }

  return (
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
  )
}
