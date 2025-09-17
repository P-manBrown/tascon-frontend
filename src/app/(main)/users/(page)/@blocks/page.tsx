import { NoSymbolIcon } from '@heroicons/react/24/solid'
import { Suspense } from 'react'
import { EmptyList } from '@/components/empty-list'
import { UsersSectionHeading } from '@/components/headings/users-section-heading'
import { UsersSectionHeaderLayout } from '@/components/layouts/users-section-header-layout'
import { UsersSectionHeadingLayout } from '@/components/layouts/users-section-heading-layout'
import { UsersSectionHeaderLink } from '@/components/links/users-section-header-link'
import { BlocksCardsCollapsibleSection } from './_components/block-cards-collapsible-section'
import {
  BlocksItemCountSummary,
  LoadingBlocksItemCountSummary,
} from './_components/blocks-item-count-summary'
import {
  LoadingUsersBlockList,
  UsersBlockList,
} from './_components/users-block-list'

const limit = 12

export default async function UsersBlocks() {
  return (
    <section>
      <UsersSectionHeaderLayout>
        <UsersSectionHeadingLayout>
          <UsersSectionHeading icon={<NoSymbolIcon className="size-5" />}>
            ブロックしているユーザー
          </UsersSectionHeading>
          <Suspense fallback={<LoadingBlocksItemCountSummary />}>
            <BlocksItemCountSummary limit={limit} />
          </Suspense>
        </UsersSectionHeadingLayout>
        <UsersSectionHeaderLink href="/users/blocks" />
      </UsersSectionHeaderLayout>
      <BlocksCardsCollapsibleSection>
        <div className="p-4">
          <Suspense fallback={<LoadingUsersBlockList limit={limit} />}>
            <UsersBlockList
              limit={limit}
              fallback={
                <div className="my-28">
                  <EmptyList description="ブロックしているユーザーは存在しません。" />
                </div>
              }
            />
          </Suspense>
        </div>
      </BlocksCardsCollapsibleSection>
    </section>
  )
}
