'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { Label } from '@/components/form-controls/label'
import { TextField } from '@/components/form-controls/text-field'
import { VisibilityToggleIcon } from '@/components/visibility-toggle-icon'
import { useVisibilityToggle } from '@/components/visibility-toggle-icon/use-visibility-toggle'
import { resetPasswordSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { resetPassword } from './reset-password.api'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

type Props = {
  resetPasswordToken: string
}

export function ResetPasswordForm({ resetPasswordToken }: Props) {
  const id = useId()
  const { isVisible, toggleVisible } = useVisibilityToggle()
  const router = useRouter()
  const { openErrorSnackbar } = useErrorSnackbar()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(resetPasswordSchema),
  })

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 401) {
      router.push('/password/forgot?err=invalid_token')
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    const result = await resetPassword({ resetPasswordToken, ...data })
    if (result.status === 'error') {
      if (result.name === 'HttpError') {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
      reset()
      router.push('/tasks')
    }
  }

  return (
    <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
      <Label htmlFor={`${id}-password`}>新しいパスワード</Label>
      <TextField
        id={`${id}-password`}
        type={isVisible ? 'text' : 'password'}
        autoComplete="new-password"
        register={register('password')}
        errors={errors.password}
        suffixIcon={
          <IconButton
            type="button"
            aria-label={isVisible ? 'パスワードを隠す' : 'パスワードを表示する'}
            onClick={toggleVisible}
          >
            <VisibilityToggleIcon isVisible={isVisible} className="size-5" />
          </IconButton>
        }
      />
      <Button
        type="submit"
        className="btn-primary mt-9"
        status={isSubmitting ? 'pending' : 'idle'}
      >
        パスワード再設定
      </Button>
    </form>
  )
}
