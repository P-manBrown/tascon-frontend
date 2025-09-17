import { UserCard, LoadingUserCard } from '@/components/cards/user-card'
import { CreateContactFromSuggestionButton } from './create-contact-from-suggestion-button'

type SuggestionCardsProps = {
  users: Array<{
    id: number
    name: string
    bio?: string
    avatarUrl?: string
  }>
  currentUserId: string
  className: string
}

const buttonLayoutClasses = 'relative z-10 mt-4'

export function SuggestionCards({
  users,
  currentUserId,
  className,
}: SuggestionCardsProps) {
  return (
    <div className={className}>
      {users.map((user) => (
        <UserCard
          key={user.id}
          id={user.id}
          name={user.name}
          bio={user.bio}
          avatarUrl={user.avatarUrl}
        >
          <div className={buttonLayoutClasses}>
            <CreateContactFromSuggestionButton
              userId={user.id}
              currentUserId={currentUserId}
            />
          </div>
        </UserCard>
      ))}
    </div>
  )
}

type LoadingSuggestionCardsProps = Pick<SuggestionCardsProps, 'className'> & {
  limit: number
}

export function LoadingSuggestionCards({
  limit,
  className,
}: LoadingSuggestionCardsProps) {
  return (
    <div className={className}>
      {Array.from({ length: limit }).map((_, index) => (
        <LoadingUserCard key={index}>
          <div className={buttonLayoutClasses}>
            <div className="skeleton shape-btn" />
          </div>
        </LoadingUserCard>
      ))}
    </div>
  )
}
