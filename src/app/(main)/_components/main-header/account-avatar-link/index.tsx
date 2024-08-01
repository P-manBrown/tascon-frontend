import { redirect } from 'next/navigation'
import { LoadingAvatar } from '@/components/avatars/avatar'
import { validateToken } from '@/utils/api/server/validate-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { AccountLink } from './account-link'

const avatarSize = 32

export async function CurrentUserAvatarLink() {
  const handleHttpError = (err: HttpError) => {
    if (err.status === 401) {
      const redirectLoginPath = generateRedirectLoginPath()
      redirect(redirectLoginPath)
    }

    throw err
  }

  const result = await validateToken()
  if (result instanceof Error) {
    if (result instanceof HttpError) {
      handleHttpError(result)
    }

    throw result
  }
  const { data: currentUser } = result

  return (
    <AccountLink
      size={avatarSize}
      name={currentUser.name}
      avatarUrl={currentUser.avatarUrl}
    />
  )
}

export function LoadingAccountAvatarLink() {
  return <LoadingAvatar size={avatarSize} />
}
