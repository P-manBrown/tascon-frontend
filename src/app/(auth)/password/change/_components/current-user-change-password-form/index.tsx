import { headers } from 'next/headers'
import { IconMessage } from '@/components/icon-message'
import { Spinner } from '@/components/spinner'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { ChangePasswordForm } from './change-password-form'
import { NextActionButton } from './next-action-button'

type Props = {
  resetPasswordToken: null
}

export async function CurrentUserChangePasswordForm({
  resetPasswordToken,
}: Props) {
  const { data: currentUser } = await getCurrentUser()
  const referer = headers().get('referer')

  return (
    <ChangePasswordForm
      resetPasswordToken={resetPasswordToken}
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
