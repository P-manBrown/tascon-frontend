import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { changePasswordSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { requestResetPasswordEmail } from '@/utils/api/request-reset-password-email'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changePassword } from './change-password.api'

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

type Params = {
  email: string
}

export function useChangePasswordFormShowButton({ email }: Params) {
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isShown, setIsShown] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const openSnackbar = useSnackbarsStore((store) => store.openSnackbar)
  const { openErrorSnackbar } = useErrorSnackbar()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<ChangePasswordFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(changePasswordSchema),
  })

  const showForm = useCallback(() => {
    setIsShown(true)
  }, [])

  const hideForm = useCallback(() => {
    setIsShown(false)
  }, [])

  const handleResetPasswordButtonClick = useCallback(async () => {
    setIsSending(true)
    const result = await requestResetPasswordEmail({ email })
    if (result.status === 'error') {
      openErrorSnackbar(result)
    } else {
      openSnackbar({
        severity: 'success',
        message: result.message,
      })
    }
    setIsSending(false)
  }, [email, openErrorSnackbar, openSnackbar])

  const handleHttpError = useCallback(
    (err: ErrorObject<HttpError>) => {
      if (err.statusCode === 401) {
        router.push(redirectLoginPath)
        router.refresh()
      } else if (err.message.startsWith('現在のパスワード')) {
        setError(
          'currentPassword',
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
    [router, redirectLoginPath, setError, openErrorSnackbar],
  )

  const onSubmit = useCallback(
    async (data: ChangePasswordFormValues) => {
      const result = await changePassword(data)
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        reset()
        hideForm()
        openSnackbar({
          severity: 'success',
          message: 'パスワードを変更しました。',
        })
      }
    },
    [handleHttpError, openErrorSnackbar, reset, openSnackbar, hideForm],
  )

  return {
    contentRef,
    containerRef,
    isShown,
    showForm,
    isSending,
    register,
    handleSubmit,
    isSubmitting,
    errors,
    handleResetPasswordButtonClick,
    onSubmit,
  }
}
