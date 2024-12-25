'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { useQueryParams } from '@/utils/query-param/use-query-params'

export function AccountQueryParamSnackbar() {
  const searchParams = useSearchParams()
  const accountConfSuccess = searchParams.get('account_confirmation_success')
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { cleanupQueryParams } = useQueryParams({ searchParams })

  useEffect(() => {
    if (searchParams.toString()) {
      if (accountConfSuccess === 'true') {
        openSnackbar({
          severity: 'success',
          message: 'メールアドレスを認証しました。',
        })
      } else if (accountConfSuccess === 'false') {
        openSnackbar({
          severity: 'error',
          message: 'メールアドレスの認証に失敗しました。再度お試しください。',
        })
      }
      cleanupQueryParams(['account_confirmation_success'])
    }
  }, [accountConfSuccess, openSnackbar, cleanupQueryParams, searchParams])

  return null
}
