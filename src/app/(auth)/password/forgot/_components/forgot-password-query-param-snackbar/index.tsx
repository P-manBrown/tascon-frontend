'use client'

import { useEffect } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { useQueryParams } from '@/utils/query-param/use-query-params'
import type { PageSearchParams } from '@/types/page'

type Props = {
  searchParams: PageSearchParams
}

export function ForgotPasswordQueryParamSnackbar({ searchParams }: Props) {
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { cleanupQueryParams } = useQueryParams()

  useEffect(() => {
    if (searchParams !== undefined) {
      if (searchParams.err === 'token_not_found') {
        openSnackbar({
          severity: 'error',
          message: 'パスワード再設定用メールからお手続きください。',
        })
      } else if (searchParams.err === 'invalid_token') {
        openSnackbar({
          severity: 'error',
          message:
            '新規パスワードの設定に失敗しました。最初からやり直してください。',
        })
      }
      cleanupQueryParams(['err'])
    }
  }, [openSnackbar, cleanupQueryParams, searchParams])

  return null
}
