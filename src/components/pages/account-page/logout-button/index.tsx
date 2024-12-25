'use client'

import { ReadonlyURLSearchParams, useRouter } from 'next/navigation'
import { useId, useRef, useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { SearchParamsLoader } from '@/components/search-params-loader'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { logout } from './logout.api'

export function LogoutButton() {
  const searchParams = useRef<ReadonlyURLSearchParams>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const redirectLoginPath = useRedirectLoginPath({
    searchParams: searchParams.current,
  })
  const id = useId()
  const router = useRouter()
  const { openErrorSnackbar } = useErrorSnackbar()

  const handleClick = async () => {
    setIsLoggingOut(true)
    const result = await logout()
    if (result.status === 'error') {
      if (result.name === 'HttpError' && result.statusCode === 404) {
        router.push(redirectLoginPath)
        router.refresh()
      } else {
        openErrorSnackbar(result)
      }
    } else {
      router.push('/')
    }
    setIsLoggingOut(false)
  }

  const handleParamsReceived = (params: ReadonlyURLSearchParams) => {
    searchParams.current = params
  }

  return (
    // 'id' is used to manage popstate events in AccountModal.
    <>
      <Button
        id={`${id}-logout-button`}
        type="button"
        className="btn-outline-danger"
        status={isLoggingOut ? 'pending' : 'idle'}
        onClick={handleClick}
      >
        ログアウト
      </Button>
      <SearchParamsLoader onParamsReceived={handleParamsReceived} />
    </>
  )
}
