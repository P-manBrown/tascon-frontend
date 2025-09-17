import {
  ItemCountSummary,
  LoadingItemCountSummary,
} from '@/components/texts/item-count-summary'
import { getContacts } from '@/utils/api/get-contacts'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

type Props = {
  limit: number
}

const baseClasses = 'max-sm:hidden'

export async function ContactsItemCountSummary({ limit }: Props) {
  const { account: currentUserId } = await getCurrentUser()
  const { contacts, pagination } = await getContacts({
    page: '1',
    currentUserId: currentUserId.id.toString(),
    limit: limit.toString(),
  })
  const currentCount = Object.keys(contacts).length

  return (
    <ItemCountSummary
      className={baseClasses}
      currentCount={currentCount}
      totalCount={pagination.totalCount}
    />
  )
}

export function LoadingContactsItemCountSummary() {
  return <LoadingItemCountSummary className={baseClasses} />
}
