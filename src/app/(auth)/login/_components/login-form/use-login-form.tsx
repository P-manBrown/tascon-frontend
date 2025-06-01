import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { loginSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { isValidValue } from '@/utils/type-guard/is-valid-value'
import { getPostLoginUrl } from '@/utils/url/get-post-login-url'
import { login } from './login.api'
import type { SubmitHandler } from 'react-hook-form'

type LoginFormValues = z.infer<typeof loginSchema>

const snackbarErrorsSchema = z.object({
  success: z.literal(false),
  errors: z.array(z.string()),
})

export function useLoginForm() {
  const fromUrl = useRef<string>(null)
  const { openErrorSnackbar } = useErrorSnackbar()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(loginSchema),
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

  const onSubmit: SubmitHandler<LoginFormValues> = useCallback(
    async (data) => {
      const result = await login(data)
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        reset()
        const targetUrl = getPostLoginUrl(fromUrl.current)
        // Using router.push() causes the page displaying the modal to become Not Found.
        location.assign(targetUrl)
      }
    },
    [handleHttpError, openErrorSnackbar, reset],
  )

  return {
    fromUrl,
    register,
    handleSubmit,
    onSubmit,
    isSubmitting,
    errors,
  }
}
