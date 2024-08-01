import Link from 'next/link'
import { AuthHeading } from '@/components/headings/auth-heading'
import { HorizontalRule } from '@/components/horizontal-rule'
import { SocialLoginForms } from '@/components/social-login-forms'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import { SignUpForm } from './_components/sign-up-form'
import { SignUpQueryParamSnackbar } from './_components/sign-up-query-param-snackbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規登録',
}

export default function SignUp() {
  const getCsrfTokenResult = getCsrfToken()
  if (getCsrfTokenResult instanceof Error) {
    throw getCsrfTokenResult
  }

  const csrfToken = getCsrfTokenResult

  return (
    <>
      <AuthHeading className="mb-7">新規登録</AuthHeading>
      <SignUpForm csrfToken={csrfToken} />
      <HorizontalRule className="my-6">または</HorizontalRule>
      <div className="space-y-6">
        <SocialLoginForms />
      </div>
      <div className="mt-7 text-center">
        <Link href="/login" className="link">
          アカウントをお持ちの場合はログインへ
        </Link>
      </div>
      <SignUpQueryParamSnackbar />
    </>
  )
}
