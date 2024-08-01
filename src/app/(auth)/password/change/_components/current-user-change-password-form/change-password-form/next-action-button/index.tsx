import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { Button } from '@/components/buttons/button'
import { useQueryParams } from '@/utils/query-param/use-query-params'

export function NextActionButton() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const { cleanupQueryParams } = useQueryParams()
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)

  const handleClick = () => {
    window.close()
    if (!window.closed) {
      openSnackbar({
        severity: 'error',
        message: 'ページを閉じられませんでした。',
      })
    }
  }

  useEffect(() => {
    if (from) {
      cleanupQueryParams(['from'])
    }
  }, [from, cleanupQueryParams])

  return from === 'account' ? (
    <Button
      type="button"
      className="btn-success"
      autoFocus={true}
      onClick={handleClick}
    >
      このページを閉じる
    </Button>
  ) : (
    <Link href="/tasks" className="btn btn-success" autoFocus={true}>
      タスク一覧へ
    </Link>
  )
}
