'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { useQueryParams } from '@/utils/query-param/use-query-params'

export function HomeQueryParamSnackbar() {
  const searchParams = useSearchParams()
  const error = searchParams.get('err')
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { cleanupQueryParams } = useQueryParams()

  useEffect(() => {
    if (searchParams.toString()) {
      if (error === 'omniauth_failure') {
        openSnackbar({
          severity: 'error',
          message: '認証できませんでした。再度お試しください。',
        })
      }
      cleanupQueryParams(['err'])
    }
  }, [error, openSnackbar, searchParams, cleanupQueryParams])

  return null
}
