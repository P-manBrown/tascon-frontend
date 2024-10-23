import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { HorizontalRule } from '@/components/horizontal-rule'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import { getCurrentUserId } from '@/utils/cookie/get-current-user-id'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { AccountQueryParamSnackbar } from './account-query-param-snackbar'
import { CurrentUserInfo } from './current-user-info'
import {
  DeleteCurrentUserAccountButton,
  LoadingDeleteCurrentUserAccountButton,
} from './delete-current-user-account-button'
import { LogoutButton } from './logout-button'

export function AccountPage() {
  const getCurrentUserIdResult = getCurrentUserId()
  if (getCurrentUserIdResult instanceof Error) {
    const redirectLoginPath = generateRedirectLoginPath()
    redirect(redirectLoginPath)
  }
  const currentUserId = getCurrentUserIdResult

  const getCsrfTokenResult = getCsrfToken()
  if (getCsrfTokenResult instanceof Error) {
    throw getCsrfTokenResult
  }
  const csrfToken = getCsrfTokenResult

  return (
    <div className="flex flex-col gap-y-10">
      <CurrentUserInfo />
      <HorizontalRule />
      <LogoutButton csrfToken={csrfToken} />
      <Suspense fallback={<LoadingDeleteCurrentUserAccountButton />}>
        <DeleteCurrentUserAccountButton csrfToken={csrfToken} />
      </Suspense>
      <AccountQueryParamSnackbar />
    </div>
  )
}
