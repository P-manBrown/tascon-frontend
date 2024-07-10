import Link from 'next/link'
import { AuthHeading } from '@/components/headings/auth-heading'
import { HorizontalRule } from '@/components/horizontal-rule'
import { SocialLoginForms } from '@/components/social-login-forms'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import { LoginForm } from './_components/login-form'
import { LoginQueryParamSnackbar } from './_components/login-query-param-snackbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
}

export default function Login() {
  const result = getCsrfToken()
  if (result instanceof Error) {
    throw result
  }

  const csrfToken = result

  return (
    <>
      <AuthHeading className="mb-7">ログイン</AuthHeading>
      <LoginForm csrfToken={csrfToken} />
      <HorizontalRule className="my-8">または</HorizontalRule>
      <div className="space-y-8">
        <SocialLoginForms />
      </div>
      <div className="mt-10 text-center">
        <Link href="/sign-up" className="link">
          アカウントを新規作成
        </Link>
      </div>
      <LoginQueryParamSnackbar />
    </>
  )
}
