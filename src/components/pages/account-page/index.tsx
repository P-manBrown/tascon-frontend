import { Suspense } from 'react'
import { HorizontalRule } from '@/components/horizontal-rule'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import { AccountQueryParamSnackbar } from './account-query-param-snackbar'
import { CurrentUserInfo } from './current-user-info'
import {
  DeleteCurrentUserAccountButton,
  LoadingDeleteCurrentUserAccountButton,
} from './delete-current-user-account-button'
import { LogoutButton } from './logout-button'

export function AccountPage() {
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
