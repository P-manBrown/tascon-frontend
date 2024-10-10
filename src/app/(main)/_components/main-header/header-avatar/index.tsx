import { redirect } from 'next/navigation'
import { Avatar } from '@/components/avatars/avatar'
import { LoadingAvatar } from '@/components/avatars/avatar'
import { validateToken } from '@/utils/api/server/validate-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'

const size = 32

export async function HeaderAvatar() {
  const handleHttpError = (err: HttpError) => {
    if (err.statusCode === 401) {
      const redirectLoginPath = generateRedirectLoginPath()
      redirect(redirectLoginPath)
    }

    throw err
  }

  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    if (validateTokenResult instanceof HttpError) {
      handleHttpError(validateTokenResult)
    }

    throw validateTokenResult
  }
  const { name, avatarUrl } = validateTokenResult.data

  return (
    <Avatar name={name} avatarUrl={avatarUrl} size={size} priority={true} />
  )
}

export function LoadingHeaderAvatar() {
  return <LoadingAvatar size={size} />
}
