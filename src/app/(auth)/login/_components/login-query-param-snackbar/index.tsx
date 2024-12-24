'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { useQueryParams } from '@/utils/query-param/use-query-params'

export function LoginQueryParamSnackbar() {
  const searchParams = useSearchParams()
  const error = searchParams.get('err')
  const isAccountConfirmationSuccessful = searchParams.get(
    'account_confirmation_success',
  )
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { cleanupQueryParams } = useQueryParams()

  useEffect(() => {
    if (searchParams.toString()) {
      if (isAccountConfirmationSuccessful === 'true') {
        openSnackbar({
          severity: 'success',
          message: 'メールアドレスを認証しました。ログインしてください。',
        })
      } else if (isAccountConfirmationSuccessful === 'false') {
        openSnackbar({
          severity: 'error',
          message: 'メールアドレスの認証に失敗しました。再度お試しください。',
        })
      } else if (error === 'unauthorized') {
        openSnackbar({
          severity: 'error',
          message: '作業するにはログインしてください。',
        })
      }
      cleanupQueryParams(['err', 'account_confirmation_success'])
    }
  }, [
    error,
    isAccountConfirmationSuccessful,
    openSnackbar,
    searchParams,
    cleanupQueryParams,
  ])

  return null
}
