import Link from 'next/link'
import { AuthHeading } from '@/components/headings/auth-heading'
import { ResetPasswordForm } from './_components/reset-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードリセット',
}

export default function ResetPassword() {
  return (
    <>
      <AuthHeading className="mb-8">パスワードリセット</AuthHeading>
      <ResetPasswordForm />
      <div className="mt-5 text-center">
        <Link href="/login" className="link">
          ログイン画面へ
        </Link>
      </div>
    </>
  )
}
