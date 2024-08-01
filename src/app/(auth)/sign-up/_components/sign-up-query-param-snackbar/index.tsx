'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { useQueryParams } from '@/utils/query-param/use-query-params'

export function SignUpQueryParamSnackbar() {
  const searchParams = useSearchParams()
  const error = searchParams.get('err')
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
      }
      cleanupQueryParams(['err'])
    }
  }, [searchParams, error, openSnackbar, cleanupQueryParams])

  return null
}
