import Link from 'next/link'
import { Suspense } from 'react'
import { AuthHeading } from '@/components/headings/auth-heading'
import { HorizontalRule } from '@/components/horizontal-rule'
import { SocialLoginForms } from '@/components/social-login-forms'
import { LoginForm } from './_components/login-form'
import { LoginQueryParamSnackbar } from './_components/login-query-param-snackbar'
import type { PageSearchParams } from '@/types/page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
}

type Props = {
  searchParams: PageSearchParams
}

export default function Login({ searchParams }: Props) {
  let fromUrl = searchParams.from_url
  if (typeof fromUrl !== 'string') {
    fromUrl = undefined
  }

  return (
    <>
      <AuthHeading className="mb-7">ログイン</AuthHeading>
      <Suspense>
        <LoginForm />
      </Suspense>
      <HorizontalRule className="my-8">または</HorizontalRule>
      <div className="space-y-8">
        <SocialLoginForms fromUrl={fromUrl} />
      </div>
      <div className="mt-10 text-center">
        <Link href="/sign-up" className="link">
          アカウントを新規作成
        </Link>
      </div>
      <Suspense>
        <LoginQueryParamSnackbar />
      </Suspense>
    </>
  )
}
