import Link from 'next/link'
import { AuthHeading } from '@/components/headings/auth-heading'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import { ResetPasswordForm } from './_components/reset-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードリセット',
}

export default function ResetPassword() {
  const getCsrfTokenResult = getCsrfToken()
  if (getCsrfTokenResult instanceof Error) {
    throw getCsrfTokenResult
  }

  const csrfToken = getCsrfTokenResult

  return (
    <>
      <AuthHeading className="mb-8">パスワードリセット</AuthHeading>
      <ResetPasswordForm csrfToken={csrfToken} />
      <div className="mt-5 text-center">
        <Link href="/login" className="link">
          ログイン画面へ
        </Link>
      </div>
    </>
  )
}
