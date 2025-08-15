import { Suspense } from 'react'
import { LoadingUserPage, UserPage } from '@/components/pages/user-page'
import type { Metadata } from 'next/types'

export const metadata: Metadata = {
  title: 'ユーザー詳細',
}

// TEMP: https://github.com/vercel/next.js/issues/58123
// TEMP: https://github.com/vercel/next.js/issues/59316

type Props = {
  params: Promise<{ id: string }>
}

export default async function User(props: Props) {
  const params = await props.params
  const { id } = params

  return (
    <Suspense fallback={<LoadingUserPage />}>
      <UserPage id={id} />
    </Suspense>
  )
}
