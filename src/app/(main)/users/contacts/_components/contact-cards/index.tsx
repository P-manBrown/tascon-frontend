import { ContactCard, LoadingContactCard } from './contact-card'
import { EmptyContacts } from './empty-contacts'
import { getContacts } from '../../get-contacts.api'

type Props = {
  page: string
}

const layoutClasses =
  'grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'

export async function ContactCards({ page }: Props) {
  const { contacts } = await getContacts(page)

  return contacts.length === 0 ? (
    <EmptyContacts />
  ) : (
    <div>
      <div className={layoutClasses}>
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            displayName={contact.displayName}
            note={contact.note}
            contactUserId={contact.contactUser.id}
            contactUserName={contact.contactUser.name}
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
