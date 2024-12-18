'use client'

import { useEffect } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { useQueryParams } from '@/utils/query-param/use-query-params'

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export function ResetPasswordQueryParamSnackbar({ searchParams }: Props) {
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { cleanupQueryParams } = useQueryParams()

  useEffect(() => {
    if (searchParams !== undefined) {
      if (searchParams.err === 'token_not_found') {
        openSnackbar({
          severity: 'error',
          message: 'パスワード再設定用メールからお手続きください。',
        })
      }
      cleanupQueryParams(['err'])
    }
  }, [openSnackbar, cleanupQueryParams, searchParams])

  return null
}
