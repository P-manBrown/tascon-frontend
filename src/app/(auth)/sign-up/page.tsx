import Link from 'next/link'
import { Suspense } from 'react'
import { AuthHeading } from '@/components/headings/auth-heading'
import { HorizontalRule } from '@/components/horizontal-rule'
import { SocialLoginForms } from '@/components/social-login-forms'
import { SignUpForm } from './_components/sign-up-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規登録',
}

export default function SignUp() {
  return (
    <>
      <AuthHeading className="mb-7">新規登録</AuthHeading>
      <SignUpForm />
      <HorizontalRule className="my-6">または</HorizontalRule>
      <div className="space-y-6">
        <Suspense>
          <SocialLoginForms />
        </Suspense>
      </div>
      <div className="mt-7 text-center">
        <Link href="/login" className="link">
          アカウントをお持ちの場合はログインへ
        </Link>
      </div>
    </>
  )
}
