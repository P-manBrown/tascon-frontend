import Link from 'next/link'
import { AuthHeading } from '@/components/headings/auth-heading'
import { HorizontalRule } from '@/components/horizontal-rule'
import { SocialLoginForms } from '@/components/social-login-forms'
import { getFromUrl } from '@/utils/url/get-from-url'
import { SignUpForm } from './_components/sign-up-form'
import type { SearchParams } from '@/types/page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規登録',
}

type Props = {
  searchParams: SearchParams
}

export default function SignUp({ searchParams }: Props) {
  const fromUrl = getFromUrl(searchParams)

  return (
    <>
      <AuthHeading className="mb-7">新規登録</AuthHeading>
      <SignUpForm />
      <HorizontalRule className="my-6">または</HorizontalRule>
      <div className="space-y-6">
        <SocialLoginForms fromUrl={fromUrl} />
      </div>
      <div className="mt-7 text-center">
        <Link href="/login" className="link">
          アカウントをお持ちの場合はログインへ
        </Link>
      </div>
    </>
  )
}
