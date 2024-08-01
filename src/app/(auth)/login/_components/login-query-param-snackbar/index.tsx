'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { useQueryParams } from '@/utils/query-param/use-query-params'

export function LoginQueryParamSnackbar() {
  const searchParams = useSearchParams()
  const error = searchParams.get('err')
  const hasFromUrl = searchParams.has('from_url')
  const isAccountConfirmationSuccessful = searchParams.get(
    'account_confirmation_success'
  )
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { cleanupQueryParams } = useQueryParams()

  useEffect(() => {
    if (searchParams.toString()) {
      if (error === 'omniauth_record_invalid') {
        openSnackbar({
          severity: 'error',
          message: '認証できませんでした。別のアカウントでお試しください。',
        })
      } else if (error === 'omniauth_failure') {
        openSnackbar({
          severity: 'error',
          message: '認証できませんでした。再度お試しください。',
        })
      } else if (isAccountConfirmationSuccessful === 'true') {
        openSnackbar({
          severity: 'success',
          message: 'メールアドレスを認証しました。ログインしてください。',
        })
      } else if (isAccountConfirmationSuccessful === 'false') {
        openSnackbar({
          severity: 'error',
          message: 'メールアドレスの認証に失敗しました。再度お試しください。',
        })
      } else if (hasFromUrl) {
        openSnackbar({
          severity: 'error',
          message: '作業するにはログインしてください。',
        })
      }
      cleanupQueryParams(['err', 'from_url', 'account_confirmation_success'])
    }
  }, [
    hasFromUrl,
    isAccountConfirmationSuccessful,
    error,
    openSnackbar,
    searchParams,
    cleanupQueryParams,
  ])

  return null
}
