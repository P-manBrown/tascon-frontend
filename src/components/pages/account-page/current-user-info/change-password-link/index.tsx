import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { validateToken } from '@/utils/api/server/validate-token'

const layoutClasses = 'h-12 flex items-center'

export async function ChangePasswordLink() {
  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    throw validateTokenResult
  }
  const { provider } = validateTokenResult.data

  const isEmailProvider = provider === 'email'

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
