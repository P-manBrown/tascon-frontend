import Link from 'next/link'
import { AuthHeading } from '@/components/headings/auth-heading'
import { ResetPasswordForm } from './_components/reset-password-form'
import { ResetPasswordQueryParamSnackbar } from './_components/reset-password-query-param-snackbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードリセット',
}

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ResetPassword({ searchParams }: Props) {
  return (
    <>
      <AuthHeading className="mb-8">パスワードリセット</AuthHeading>
      <ResetPasswordForm />
      <div className="mt-5 text-center">
        <Link href="/login" className="link">
          ログイン画面へ
        </Link>
      </div>
      <ResetPasswordQueryParamSnackbar searchParams={searchParams} />
    </>
  )
}
