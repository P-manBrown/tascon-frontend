import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { loginSchema } from '@/schemas/request/auth'
import { login } from './login.api'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

type LoginFormValues = z.infer<typeof loginSchema>

const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export function useLoginForm() {
  const searchParams = useSearchParams()
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
        const fromUrl = searchParams.get('from_url')
        let targetUrl = `${origin}/tasks`
        if (fromUrl && URL.canParse(fromUrl)) {
          const fromOrigin = new URL(fromUrl).origin
          if (fromOrigin === origin) {
            targetUrl = fromUrl
          }
        }
        location.assign(targetUrl)
      }
    },
    [openErrorSnackbar, reset, searchParams],
  )

  return {
    register,
    handleSubmit,
    onSubmit,
    isSubmitting,
    errors,
  }
}
