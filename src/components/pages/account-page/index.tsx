import { Suspense } from 'react'
import { HorizontalRule } from '@/components/horizontal-rule'
import { AccountQueryParamSnackbar } from './account-query-param-snackbar'
import { CurrentUserInfo } from './current-user-info'
import {
  DeleteCurrentUserAccountButton,
  LoadingDeleteCurrentUserAccountButton,
} from './delete-current-user-account-button'
import { LogoutButton } from './logout-button'

export function AccountPage() {
  return (
    <div className="flex flex-col gap-y-10">
      <CurrentUserInfo />
      <HorizontalRule />
      <Suspense>
        <LogoutButton />
      </Suspense>
      <Suspense fallback={<LoadingDeleteCurrentUserAccountButton />}>
        <DeleteCurrentUserAccountButton />
      </Suspense>
      <Suspense>
        <AccountQueryParamSnackbar />
      </Suspense>
    </div>
  )
}
