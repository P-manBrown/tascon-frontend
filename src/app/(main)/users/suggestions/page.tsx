import { Suspense } from 'react'
import { UsersHeading } from '@/components/headings/users-heading'
import { UsersHeaderLayout } from '@/components/layouts/users-header-layout'
import { ScrollAnchor } from '@/components/scroll-anchor'
import { UsersDescription } from '@/components/texts/users-description'
import {
  SuggestionsPaginatedList,
  LoadingSuggestionsPaginatedList,
} from './_components/suggestions-paginated-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '関係のあるユーザー一覧',
}

type Props = {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function Suggestions({ searchParams }: Props) {
  const params = await searchParams
  const { page } = params

  return (
    <div>
      <ScrollAnchor page={page ?? '1'} />
      <UsersHeaderLayout>
        <UsersHeading>関係のあるユーザー</UsersHeading>
        <UsersDescription>
          あなたを登録していたり、テンプレートの共有やチャットなどをしているユーザーが表示されます。
          <br />
          ここに表示されているユーザーはメールアドレスなしで登録できます。
        </UsersDescription>
      </UsersHeaderLayout>
      <div className="mt-5">
        <Suspense
          key={page}
          fallback={<LoadingSuggestionsPaginatedList page={page} />}
        >
          <SuggestionsPaginatedList page={page ?? '1'} />
        </Suspense>
      </div>
    </div>
  )
}
