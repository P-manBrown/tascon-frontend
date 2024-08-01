import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeAvatar } from './change-avatar.api'
import { changeAvatarSchema } from './change-avatar.schema'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

type Params = {
  initialAvatarUrl: string | null
  csrfToken: string
}

type ChangeAvatarFormValue = z.infer<typeof changeAvatarSchema>

export function useEditableAvatar({ initialAvatarUrl, csrfToken }: Params) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
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

  const handleChangeHttpError = (err: HttpError) => {
    if (err.status === 404) {
      router.replace(redirectLoginPath)
    } else if (err.status === 422) {
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
      const result = await changeAvatar({
        csrfToken,
        avatar: data.avatar[0],
      })
      if (result instanceof Error) {
        if (result instanceof HttpError) {
          handleChangeHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        setAvatarUrl(result.data.avatarUrl)
        reset()
      }
    }
  }

  const handleDeleteHttpError = (err: HttpError) => {
    if (err.status === 404) {
      router.replace(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const handleXMarkClick = async () => {
    setIsDeletingAvatar(true)
    reset()
    const result = await changeAvatar({
      csrfToken,
      avatar: null,
    })
    if (result instanceof Error) {
      if (result instanceof HttpError) {
        handleDeleteHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
      setAvatarUrl(result.data.avatarUrl)
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
    avatarUrl,
    isDeletingAvatar,
    registerRest,
  }
}
