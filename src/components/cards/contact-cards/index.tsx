import { LoadingUserCard, UserCard } from '../user-card'
import { ContactNote, LoadingContactNote } from './contact-note'

type Props = {
  contacts: Array<
    React.ComponentProps<typeof ContactNote> & {
      id: number
      displayName?: string
      contactUser: Omit<React.ComponentProps<typeof UserCard>, 'children'>
    }
  >
  className: string
}

export function ContactCards({ contacts, className }: Props) {
  return (
    <div className={className}>
      {contacts.map((contact) => {
        const userName =
          contact.displayName === undefined || contact.displayName === ''
            ? contact.contactUser.name
            : contact.displayName
        return (
          <UserCard
            key={contact.contactUser.id}
            id={contact.contactUser.id}
            name={userName}
            bio={contact.contactUser.bio}
            avatarUrl={contact.contactUser.avatarUrl}
          >
            <ContactNote note={contact.note} />
          </UserCard>
        )
      })}
    </div>
  )
}

type LoadingContactCardsProps = Pick<Props, 'className'> & {
  limit: number
}

export function LoadingContactCards({
  limit,
  className,
}: LoadingContactCardsProps) {
  return (
    <div className={className}>
      {Array.from({ length: limit }).map((_, index) => (
        <LoadingUserCard key={index}>
          <LoadingContactNote key={index} />
        </LoadingUserCard>
      ))}
    </div>
  )
}
