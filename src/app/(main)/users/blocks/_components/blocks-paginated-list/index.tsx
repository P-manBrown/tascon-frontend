import { BlockCards, LoadingBlockCards } from '@/components/cards/block-cards'
import { EmptyList } from '@/components/empty-list'
import { Pagination, LoadingPagination } from '@/components/pagination'
import { getBlocks } from '@/utils/api/get-blocks'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

type Props = {
  page: string
}

const limit = 18
const cardsLayoutClasses =
  'grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
const paginationLayoutClasses = 'mt-6'

export async function BlocksPaginatedList({ page }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { blocks, pagination } = await getBlocks({
    currentUserId: currentUser.id.toString(),
    page,
    limit: limit.toString(),
  })

  return (
    <div>
      {blocks.length === 0 ? (
        <div className="my-28 md:my-48">
          <EmptyList description="ブロックしているユーザーは存在しません。" />
        </div>
      ) : (
        <BlockCards blocks={blocks} className={cardsLayoutClasses} />
      )}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  )
}

type LoadingBlocksPaginatedListProps = {
  page: Props['page'] | undefined
}

export function LoadingBlocksPaginatedList({
  page,
}: LoadingBlocksPaginatedListProps) {
  return (
    <div>
      <LoadingBlockCards limit={limit} className={cardsLayoutClasses} />
      {page !== undefined && (
        <div className={paginationLayoutClasses}>
          <LoadingPagination />
        </div>
      )}
    </div>
  )
}
