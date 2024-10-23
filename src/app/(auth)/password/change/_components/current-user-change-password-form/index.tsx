import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { IconMessage } from '@/components/icon-message'
import { Spinner } from '@/components/spinner'
import { validateToken } from '@/utils/api/server/validate-token'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { ChangePasswordForm } from './change-password-form'
import { NextActionButton } from './next-action-button'

export async function CurrentUserChangePasswordForm() {
  const handleHttpError = (err: HttpError) => {
    if (err.status === 401) {
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
  const { data: currentUser } = validateTokenResult

  const getCsrfTokenResult = getCsrfToken()
  if (getCsrfTokenResult instanceof Error) {
    throw getCsrfTokenResult
  }
  const csrfToken = getCsrfTokenResult

  const referer = headers().get('referer')

  return (
    <ChangePasswordForm
      allowPasswordChange={currentUser.allowPasswordChange}
      nameInput={
        <input
          type="text"
          autoComplete="username"
          value={currentUser.name}
          className="hidden"
          readOnly={true}
        />
      }
      emailInput={
        <input
          type="email"
          autoComplete="email"
          value={currentUser.email}
          className="hidden"
          readOnly={true}
        />
      }
      successMessage={
        <IconMessage severity="success" title="パスワード変更完了">
          <p className="mb-5 text-center">パスワードを変更しました。</p>
          <NextActionButton referer={referer} />
        </IconMessage>
      }
      csrfToken={csrfToken}
    />
  )
}

export function LoadingCurrentUserChangePasswordForm() {
  return (
    <div className="flex h-52 items-center justify-center">
      <Spinner className="size-10 border-4 border-gray-500" />
    </div>
  )
}
