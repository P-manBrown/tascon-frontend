import { AuthHeading } from '@/components/headings/auth-heading'
import { ResetPasswordForm } from './_components/reset-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規パスワード設定',
}

export default function ResetPassword() {
  return (
    <>
      <AuthHeading className="mb-8">新規パスワード設定</AuthHeading>
      <div className="mx-2">
        <ResetPasswordForm />
      </div>
    </>
  )
}
