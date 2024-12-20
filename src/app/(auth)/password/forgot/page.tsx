import Link from 'next/link'
import { AuthHeading } from '@/components/headings/auth-heading'
import { ForgotPasswordQueryParamSnackbar } from './_components/forgot-password-query-param-snackbar'
import { RequestResetPasswordEmailForm } from './_components/request-reset-password-email-form'
import type { SearchParams } from '@/types/page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードリセット',
}

type Props = {
  searchParams: SearchParams
}

export default function ForgotPassword({ searchParams }: Props) {
  return (
    <>
      <AuthHeading className="mb-8">パスワードリセット</AuthHeading>
      <RequestResetPasswordEmailForm />
      <div className="mt-5 text-center">
        <Link href="/login" className="link">
          ログイン画面へ
        </Link>
      </div>
      <ForgotPasswordQueryParamSnackbar searchParams={searchParams} />
    </>
  )
}
