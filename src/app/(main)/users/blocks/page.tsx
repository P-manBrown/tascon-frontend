import { Suspense } from 'react'
import { UsersHeading } from '@/components/headings/users-heading'
import { UsersHeaderLayout } from '@/components/layouts/users-header-layout'
import { LoadingPagination } from '@/components/pagination'
import { ScrollAnchor } from '@/components/scroll-anchor'
import { UsersDescription } from '@/components/texts/users-description'
import { BlocksCards, LoadingBlocksCards } from './_components/blocks-cards'
import { BlocksPagination } from './_components/blocks-pagination'
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
        <Suspense key={page} fallback={<LoadingBlocksCards />}>
          <BlocksCards page={page ?? '1'} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense
          key={page}
          fallback={page === undefined ? null : <LoadingPagination />}
        >
          <BlocksPagination page={page ?? '1'} />
        </Suspense>
      </div>
    </div>
  )
}
