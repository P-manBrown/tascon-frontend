import {
  SuggestionCards,
  LoadingSuggestionCards,
} from '@/components/cards/suggestion-cards'
import { EmptyList } from '@/components/empty-list'
import { Pagination, LoadingPagination } from '@/components/paginations'
import { getSuggestions } from '@/utils/api/get-suggestions'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

type Props = {
  page: string
}

const limit = 18
const cardsLayoutClasses =
  'grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
const paginationLayoutClasses = 'mt-6'

export async function SuggestionsPaginatedList({ page }: Props) {
  const { suggestions, pagination } = await getSuggestions({
    page,
    limit: limit.toString(),
  })
  const { account: currentUser } = await getCurrentUser()

  return (
    <div>
      {suggestions.length === 0 ? (
        <div className="my-28 md:my-48">
          <EmptyList description="関係のあるユーザーは存在しません。" />
        </div>
      ) : (
        <SuggestionCards
          users={suggestions}
          currentUserId={currentUser.id.toString()}
          className={cardsLayoutClasses}
        />
      )}
      {pagination.totalPages > 1 && (
        <div className={paginationLayoutClasses}>
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  )
}

type LoadingSuggestionsPaginatedListProps = {
  page: Props['page'] | undefined
}

export function LoadingSuggestionsPaginatedList({
  page,
}: LoadingSuggestionsPaginatedListProps) {
  return (
    <div>
      <LoadingSuggestionCards limit={limit} className={cardsLayoutClasses} />
      {page !== undefined && (
        <div className={paginationLayoutClasses}>
          <LoadingPagination />
        </div>
      )}
    </div>
  )
}
