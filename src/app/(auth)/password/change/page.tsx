import { cookies, headers } from 'next/headers'
import { Suspense } from 'react'
import { AuthHeading } from '@/components/headings/auth-heading'
import { IconMessage } from '@/components/icon-message'
import {
  CurrentUserChangePasswordForm,
  LoadingCurrentUserChangePasswordForm,
} from './_components/current-user-change-password-form'
import { ChangePasswordForm } from './_components/current-user-change-password-form/change-password-form'
import { NextActionButton } from './_components/current-user-change-password-form/next-action-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワード変更',
}

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ChangePassword() {
  const cookieStore = cookies()
  const resetPasswordToken =
    cookieStore.get('resetPasswordToken')?.value ?? null
  const referer = headers().get('referer')

  return (
    <>
      <AuthHeading className="mb-8">パスワード変更</AuthHeading>
      <div className="mx-2">
        {resetPasswordToken === null ? (
          <Suspense fallback={<LoadingCurrentUserChangePasswordForm />}>
            <CurrentUserChangePasswordForm
              resetPasswordToken={resetPasswordToken}
            />
          </Suspense>
        ) : (
          <ChangePasswordForm
            resetPasswordToken={resetPasswordToken}
            successMessage={
              <IconMessage severity="success" title="パスワード変更完了">
                <p className="mb-5 text-center">パスワードを変更しました。</p>
                <NextActionButton referer={referer} />
              </IconMessage>
            }
          />
        )}
      </div>
    </>
  )
}
