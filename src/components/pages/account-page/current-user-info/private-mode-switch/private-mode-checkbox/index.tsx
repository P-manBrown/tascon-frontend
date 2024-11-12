'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Checkbox } from '@/components/form-controls/checkbox'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeIsPrivate } from './change-is-private.api'

type PrivateModeSwitchProps = Pick<
  React.ComponentProps<typeof Checkbox>,
  'toggleIcon' | 'description'
> & {
  isPrivate: boolean
}

export function PrivateModeCheckbox({
  isPrivate,
  toggleIcon,
  description,
}: PrivateModeSwitchProps) {
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const [isChangingIsPrivate, setIsChangingIsPrivate] = useState(false)

  const handleKeyDown = (ev: React.KeyboardEvent<HTMLLabelElement>) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && !ev.metaKey) {
      ev.preventDefault()
      ev.currentTarget.click()
    }
  }

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 404) {
      router.replace(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const handleChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    setIsChangingIsPrivate(true)
    const result = await changeIsPrivate({ isPrivate: ev.target.checked })
    if (result.status === 'error') {
      if (result.name === 'HttpError') {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    }
    setIsChangingIsPrivate(false)
  }

  return (
    <Checkbox
      checked={isPrivate}
      disabled={isChangingIsPrivate}
      toggleIcon={toggleIcon}
      description={description}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
    />
  )
}
