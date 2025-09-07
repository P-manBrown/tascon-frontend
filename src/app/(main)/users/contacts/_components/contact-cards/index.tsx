import { EmptyList } from '@/components/empty-list'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { ContactCard, LoadingContactCard } from './contact-card'
import { getContacts } from '../../get-contacts.api'

type Props = {
  page: string
}

const layoutClasses =
  'grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'

export async function ContactCards({ page }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { contacts } = await getContacts(page, currentUser.id.toString())

  return contacts.length === 0 ? (
    <div className="my-28 md:my-48">
      <EmptyList description="登録しているユーザーは存在しません。" />
    </div>
  ) : (
    <div>
      <div className={layoutClasses}>
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            displayName={contact.displayName}
            note={contact.note}
            id={contact.contactUser.id}
            name={contact.contactUser.name}
            bio={contact.contactUser.bio}
            avatarUrl={contact.contactUser.avatarUrl}
          />
        ))}
      </div>
    </div>
  )
}

export function LoadingContactCards() {
  return (
    <div className={layoutClasses}>
      {Array.from({ length: 18 }).map((_, index) => (
        <LoadingContactCard key={index} />
      ))}
    </div>
  )
}
