import {
  ContactCards,
  LoadingContactCards,
} from '@/components/cards/contact-cards'
import { getContacts } from '@/utils/api/get-contacts'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

const cardsLayoutClasses =
  'grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'

type Props = {
  limit: string
  fallback: React.ReactElement
}

export async function UsersContactList({ limit, fallback }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { contacts } = await getContacts({
    page: '1',
    currentUserId: currentUser.id.toString(),
    limit,
  })

  return (
    <div>
      {contacts.length === 0 ? (
        fallback
      ) : (
        <ContactCards contacts={contacts} className={cardsLayoutClasses} />
      )}
    </div>
  )
}

type LoadingUsersContactList = Pick<
  React.ComponentProps<typeof LoadingContactCards>,
  'limit'
>

export function LoadingUsersContactList({ limit }: LoadingUsersContactList) {
  return <LoadingContactCards limit={limit} className={cardsLayoutClasses} />
}
