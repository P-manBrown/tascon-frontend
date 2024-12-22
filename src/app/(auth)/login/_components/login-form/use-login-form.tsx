import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { loginSchema } from '@/schemas/request/auth'
import { getPostLoginUrl } from '@/utils/url/get-post-login-url'
import { login } from './login.api'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

type LoginFormValues = z.infer<typeof loginSchema>

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

  const onSubmit: SubmitHandler<LoginFormValues> = useCallback(
    async (data) => {
      const result = await login(data)
      if (result.status === 'error') {
        openErrorSnackbar(result)
      } else {
        reset()
        const targetUrl = getPostLoginUrl(fromUrl.current)
        // Using router.push() causes the page displaying the modal to become Not Found.
        location.assign(targetUrl)
      }
    },
    [openErrorSnackbar, reset],
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
