import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeAvatar } from './change-avatar.api'
import { changeAvatarSchema } from './change-avatar.schema'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

type ChangeAvatarFormValue = z.infer<typeof changeAvatarSchema>

export function useAvatarEditor() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<ChangeAvatarFormValue>({
    mode: 'onChange',
    resolver: zodResolver(changeAvatarSchema),
  })
  const { ref, ...registerRest } = register('avatar')

  const handleChangeHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 404) {
      router.replace(redirectLoginPath)
    } else if (err.statusCode === 422) {
      if (err.message.startsWith('アバター')) {
        setError('avatar', {
          type: err.status.toString(),
          message: err.message,
        })
      } else {
        openErrorSnackbar(err)
      }
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit: SubmitHandler<ChangeAvatarFormValue> = async (data) => {
    if (data.avatar.length !== 0) {
      const formData = new FormData()
      formData.append('avatar', data.avatar[0])

      const result = await changeAvatar({ formData: formData })

      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleChangeHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        reset()
      }
    }
  }

  const handleDeleteHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 404) {
      router.replace(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const handleXMarkClick = async () => {
    setIsDeletingAvatar(true)
    reset()

    const result = await changeAvatar({ formData: null })

    if (result.status === 'error') {
      if (result.name === 'HttpError') {
        handleDeleteHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    }

    setIsDeletingAvatar(false)
  }

  return {
    handleSubmit,
    onSubmit,
    handleXMarkClick,
    ref,
    isSubmitting,
    errors,
    inputRef,
    isDeletingAvatar,
    registerRest,
  }
}
