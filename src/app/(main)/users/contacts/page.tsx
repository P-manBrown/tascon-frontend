import { Suspense } from 'react'
import { ScrollAnchor } from '@/components/scroll-anchor'
import { ContactCards, LoadingContactCards } from './_components/contact-cards'
import { ContactsPagination } from './_components/contacts-pagination'
import { LoadingPagination } from './_components/contacts-pagination/pagination'
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
        <div>
          <h1 className="text-2xl font-bold">登録しているユーザー</h1>
          <p className="mt-1 text-sm">
            登録しているユーザーの一覧です。
            <br />
            ここに表示されているユーザーとチャットやテンプレートの共有ができます。
          </p>
        </div>
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
