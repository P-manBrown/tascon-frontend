import Link from 'next/link'
import { Suspense } from 'react'
import { AuthHeading } from '@/components/headings/auth-heading'
import { ForgotPasswordQueryParamSnackbar } from './_components/forgot-password-query-param-snackbar'
import { RequestResetPasswordEmailForm } from './_components/request-reset-password-email-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードリセット',
}

export default function ForgotPassword() {
  return (
    <>
      <AuthHeading className="mb-8">パスワードリセット</AuthHeading>
      <RequestResetPasswordEmailForm />
      <div className="mt-5 text-center">
        <Link href="/login" className="link">
          ログイン画面へ
        </Link>
      </div>
      <Suspense>
        <ForgotPasswordQueryParamSnackbar />
      </Suspense>
    </>
  )
}
