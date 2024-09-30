'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Checkbox } from '@/components/form-controls/checkbox'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeIsPrivate } from './change-is-private.api'
import { ToggleSwitch } from './toggle-switch'

type PrivateModeSwitchProps = Pick<
  React.ComponentProps<typeof Checkbox>,
  'description'
> & {
  initialIsPrivate: boolean
  label: React.ReactElement
  privacyTag: React.ReactElement
  csrfToken: string
}

export function PrivateModeSwitch({
  initialIsPrivate,
  label,
  privacyTag,
  description,
  csrfToken,
}: PrivateModeSwitchProps) {
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const [isToggleOn, setIsToggleOn] = useState(initialIsPrivate)
  const [isChangingIsPrivate, setIsChangingIsPrivate] = useState(false)

  const handleKeyDown = (ev: React.KeyboardEvent<HTMLLabelElement>) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && !ev.metaKey) {
      ev.preventDefault()
      ev.currentTarget.click()
    }
  }

  const handleHttpError = (err: HttpError) => {
    if (err.status === 404) {
      router.replace(redirectLoginPath)
    } else {
      // @ts-expect-error
      openErrorSnackbar(err)
    }
  }

  const handleChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    setIsChangingIsPrivate(true)
    const result = await changeIsPrivate({
      csrfToken,
      isPrivate: ev.target.checked,
    })
    if (result instanceof Error) {
      if (result instanceof HttpError) {
        handleHttpError(result)
      } else {
        // @ts-expect-error
        openErrorSnackbar(result)
      }
    } else {
      setIsToggleOn(result.data.isPrivate)
    }
    setIsChangingIsPrivate(false)
  }

  return (
    <div>
      <DetailItemHeadingLayout>
        {label}
        {privacyTag}
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <Checkbox
          checked={isToggleOn}
          disabled={isChangingIsPrivate}
          toggleIcon={<ToggleSwitch isToggleOn={isToggleOn} />}
          description={description}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
        />
      </DetailItemContentLayout>
    </div>
  )
}
