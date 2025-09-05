import { Suspense } from 'react'
import { UsersHeading } from '@/components/headings/users-heading'
import { UsersHeaderLayout } from '@/components/layouts/users-header-layout'
import { LoadingPagination } from '@/components/pagination'
import { ScrollAnchor } from '@/components/scroll-anchor'
import { UsersDescription } from '@/components/texts/users-description'
import { ContactCards, LoadingContactCards } from './_components/contact-cards'
import { ContactsPagination } from './_components/contacts-pagination'
import {
  CurrentUserCreateContactButton,
  LoadingCurrentUserCreateContactButton,
} from './_components/current-user-create-contact-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登録しているユーザー一覧',
}

type Props = {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function Contacts({ searchParams }: Props) {
  const params = await searchParams
  const { page } = params

  return (
    <div>
      <ScrollAnchor page={page ?? '1'} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <UsersHeaderLayout>
          <UsersHeading>登録しているユーザー</UsersHeading>
          <UsersDescription>
            あなたが登録しているユーザーの一覧です。
            <br />
            ここに表示されているユーザーとチャットやテンプレートの共有ができます。
          </UsersDescription>
        </UsersHeaderLayout>
        <Suspense fallback={<LoadingCurrentUserCreateContactButton />}>
          <CurrentUserCreateContactButton />
        </Suspense>
      </div>
      <div className="mt-5">
        <Suspense key={page} fallback={<LoadingContactCards />}>
          <ContactCards page={page ?? '1'} />
        </Suspense>
      </div>
      <div className="mt-6">
        <Suspense
          key={page}
          fallback={page === undefined ? null : <LoadingPagination />}
        >
          <ContactsPagination page={page ?? '1'} />
        </Suspense>
      </div>
    </div>
  )
}
