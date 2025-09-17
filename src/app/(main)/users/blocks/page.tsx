import { Suspense } from 'react'
import { UsersHeading } from '@/components/headings/users-heading'
import { UsersHeaderLayout } from '@/components/layouts/users-header-layout'
import { ScrollAnchor } from '@/components/scroll-anchor'
import { UsersDescription } from '@/components/texts/users-description'
import {
  BlocksPaginatedList,
  LoadingBlocksPaginatedList,
} from './_components/blocks-paginated-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ブロックしているユーザー一覧',
}

type Props = {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function Blocks({ searchParams }: Props) {
  const params = await searchParams
  const { page } = params

  return (
    <div>
      <ScrollAnchor page={page ?? '1'} />
      <UsersHeaderLayout>
        <UsersHeading>ブロックしているユーザー</UsersHeading>
        <UsersDescription>
          あなたがブロックしているユーザーの一覧です。
          <br />
          ブロックしているユーザーのアクションは非表示になり、あなたを登録できなくなります。
        </UsersDescription>
      </UsersHeaderLayout>
      <div className="mt-5">
        <Suspense
          key={page}
          fallback={<LoadingBlocksPaginatedList page={page} />}
        >
          <BlocksPaginatedList page={page ?? '1'} />
        </Suspense>
      </div>
    </div>
  )
}
