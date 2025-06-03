import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { createFormErrorsSchema } from '@/utils/form/create-form-errors-schema'
import { useHandleFormErrors } from '@/utils/form/use-handle-form-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { isValidValue } from '@/utils/type-guard/is-valid-value'
import { changeAvatar } from './change-avatar.api'
import { changeAvatarSchema } from './change-avatar.schema'
import type { SubmitHandler } from 'react-hook-form'

type ChangeAvatarFormValue = z.infer<typeof changeAvatarSchema>

const formErrorsSchema = createFormErrorsSchema(z.enum(['avatar']))

export function useAvatarEditor() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isPending, startTransition] = useTransition()
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangeAvatarFormValue>({
    mode: 'onChange',
    resolver: zodResolver(changeAvatarSchema),
  })
  const { ref, ...registerRest } = register('avatar')
  const { handleFormErrors } = useHandleFormErrors(setError)

  const handleChangeHttpError = (err: ErrorObject<HttpError>) => {
    const { statusCode, data } = err
    if (statusCode === 404) {
      router.replace(redirectLoginPath)
    } else if (isValidValue(formErrorsSchema, data)) {
      handleFormErrors(data)
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit: SubmitHandler<ChangeAvatarFormValue> = async (data) => {
    if (data.avatar.length !== 0) {
      const formData = new FormData()
      formData.append('avatar', data.avatar[0])

      startTransition(async () => {
        const result = await changeAvatar({ formData })

        if (result.status === 'error') {
          if (result.name === 'HttpError') {
            handleChangeHttpError(result)
          } else {
            openErrorSnackbar(result)
          }
        } else {
          reset()
        }
      })
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
    isPending,
    errors,
    inputRef,
    isDeletingAvatar,
    registerRest,
  }
}
