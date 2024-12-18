import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthHeading } from '@/components/headings/auth-heading'
import { ChangePasswordForm } from './_components/change-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワード変更',
}

export default function ChangePassword() {
  const cookieStore = cookies()
  const resetPasswordToken = cookieStore.get('resetPasswordToken')?.value
  if (resetPasswordToken === undefined) {
    redirect('/password/reset?err=token_not_found')
  }

  return (
    <>
      <AuthHeading className="mb-8">パスワード変更</AuthHeading>
      <div className="mx-2">
        <ChangePasswordForm resetPasswordToken={resetPasswordToken} />
      </div>
    </>
  )
}
