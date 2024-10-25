import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

const layoutClasses = 'h-12 flex items-center'

export async function ChangePasswordLink() {
  const { data: currentUser } = await getCurrentUser()
  const isEmailProvider = currentUser.provider === 'email'

  return (
    <div className={layoutClasses}>
      {isEmailProvider ? (
        <Link
          href="/password/change"
          target="_blank"
          className="btn btn-success"
        >
          パスワードを変更
          <span className="ml-2">
            <ArrowTopRightOnSquareIcon className="size-5 stroke-current" />
          </span>
        </Link>
      ) : (
        <p>SNS認証を使用しているため、パスワードの変更はできません。</p>
      )}
    </div>
  )
}

export function LoadingChangePasswordLink() {
  return <div className={`skeleton ${layoutClasses}`} />
}
