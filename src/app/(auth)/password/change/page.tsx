import { Suspense } from 'react'
import { AuthHeading } from '@/components/headings/auth-heading'
import {
  CurrentUserChangePasswordForm,
  LoadingCurrentUserChangePasswordForm,
} from './_components/current-user-change-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワード変更',
}

export default function ChangePassword() {
  return (
    <>
      <AuthHeading className="mb-8">パスワード変更</AuthHeading>
      <div className="mx-2">
        <Suspense fallback={<LoadingCurrentUserChangePasswordForm />}>
          <CurrentUserChangePasswordForm />
        </Suspense>
      </div>
    </>
  )
}
