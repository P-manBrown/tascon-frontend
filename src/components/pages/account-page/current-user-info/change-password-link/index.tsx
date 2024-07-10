'use client'

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export function ChangePasswordLink() {
  return (
    <Link
      href={{
        pathname: '/password/change',
        query: { from: 'account' },
      }}
      target="_blank"
      rel="noreferrer"
      className="btn btn-success"
    >
      パスワード変更
      <span className="ml-2">
        <ArrowTopRightOnSquareIcon className="h-5 w-5 stroke-current" />
      </span>
    </Link>
  )
}
