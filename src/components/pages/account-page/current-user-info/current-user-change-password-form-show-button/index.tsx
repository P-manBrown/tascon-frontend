import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { ChangePasswordFormShowButton } from './change-password-form-show-button'

export async function CurrentUserChangePasswordFormShowButton() {
  const { data: currentUser } = await getCurrentUser()

  return (
    <ChangePasswordFormShowButton
      provider={currentUser.provider}
      name={currentUser.name}
      email={currentUser.email}
    />
  )
}

export function LoadingCurrentUserChangePasswordFormShowButton() {
  return <div className="skeleton shape-btn" />
}
