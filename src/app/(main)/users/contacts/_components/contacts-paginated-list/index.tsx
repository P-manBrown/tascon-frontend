import { LoadingContactCards } from '@/components/cards/contact-cards'
import { ContactCards } from '@/components/cards/contact-cards'
import { EmptyList } from '@/components/empty-list'
import { Pagination, LoadingPagination } from '@/components/paginations'
import { getContacts } from '@/utils/api/get-contacts'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

type Props = {
  page: string
}

const limit = 18
const cardsLayoutClasses = 'grid gap-4 lg:grid-cols-2 xl:grid-cols-3'
const paginationLayoutClasses = 'mt-6'

export async function ContactsPaginatedList({ page }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { contacts, pagination } = await getContacts({
    page,
    currentUserId: currentUser.id.toString(),
    limit: limit.toString(),
  })

  return (
    <div>
      {contacts.length === 0 ? (
        <div className="my-28 md:my-48">
          <EmptyList description="登録しているユーザーは存在しません。" />
        </div>
      ) : (
        <ContactCards contacts={contacts} className={cardsLayoutClasses} />
      )}
      {pagination.totalPages > 1 && (
        <div className={paginationLayoutClasses}>
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  )
}

type LoadingContactsPaginatedListProps = {
  page: Props['page'] | undefined
}

export function LoadingContactsPaginatedList({
  page,
}: LoadingContactsPaginatedListProps) {
  return (
    <div>
      <LoadingContactCards limit={limit} className={cardsLayoutClasses} />
      {page !== undefined && (
        <div className={paginationLayoutClasses}>
          <LoadingPagination />
        </div>
      )}
    </div>
  )
}
