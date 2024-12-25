'use client'

import { ReadonlyURLSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { SearchParamsLoader } from '@/components/search-params-loader'
import { useQueryParams } from '@/utils/query-param/use-query-params'

export function ForgotPasswordQueryParamSnackbar() {
  const [searchParams, setSearchParams] =
    useState<ReadonlyURLSearchParams | null>(null)
  const error = searchParams?.get('err')
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { cleanupQueryParams } = useQueryParams({ searchParams })

  useEffect(() => {
    if (searchParams !== null && error !== null) {
      if (error === 'token_not_found') {
        openSnackbar({
          severity: 'error',
          message: 'パスワード再設定用メールからお手続きください。',
        })
      } else if (error === 'invalid_token') {
        openSnackbar({
          severity: 'error',
          message:
            '新規パスワードの設定に失敗しました。最初からやり直してください。',
        })
      }
      cleanupQueryParams(['err'])
    }
  }, [searchParams, error, openSnackbar, cleanupQueryParams])

  return <SearchParamsLoader onParamsReceived={setSearchParams} />
}
