'use client'

import { useId, useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { Button } from '@/components/buttons/button'
import { logout } from './logout.api'

type Props = {
  csrfToken: string
}

export function LogoutButton({ csrfToken }: Props) {
  const id = useId()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { openErrorSnackbar } = useErrorSnackbar()

  const handleClick = async () => {
    setIsLoggingOut(true)
    const result = await logout(csrfToken)
    if (result.status === 'error') {
      openErrorSnackbar(result)
    }
    setIsLoggingOut(false)
  }

  return (
    // 'id' is used to manage popstate events in AccountModal.
    <Button
      id={`${id}-logout-button`}
      type="button"
      className="btn-outline-danger"
      status={isLoggingOut ? 'pending' : 'idle'}
      onClick={handleClick}
    >
      ログアウト
    </Button>
  )
}
