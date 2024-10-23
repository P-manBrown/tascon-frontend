'use client'

import Link from 'next/link'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { Button } from '@/components/buttons/button'

type Props = {
  referer: string | null
}

export function NextActionButton({ referer }: Props) {
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

  return referer === `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN}/account` ? (
    <Button type="button" className="btn-success" onClick={handleClick}>
      このページを閉じる
    </Button>
  ) : (
    <Link href="/tasks" className="btn btn-success">
      タスク一覧へ
    </Link>
  )
}
