import { EmptyList } from '@/components/empty-list'
import { UserCard, LoadingUserCard } from '@/components/user-card'
import { getSuggestions } from '@/utils/api/get-suggestions'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { CreateContactFromSuggestionButton } from './create-contact-from-suggestion-button'

type Props = {
  page: string
}

const cardsLayoutClasses =
  'grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
const buttonLayoutClasses = 'relative z-10 mt-4'

export async function SuggestionCards({ page }: Props) {
  const { users } = await getSuggestions(page)
  const { account: currentUser } = await getCurrentUser()

  return users.length === 0 ? (
    <div className="my-28 md:my-48">
      <EmptyList description="関係のあるユーザーは存在しません。" />
    </div>
  ) : (
    <div className={cardsLayoutClasses}>
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
              currentUserId={currentUser.id.toString()}
            />
          </div>
        </UserCard>
      ))}
    </div>
  )
}

export function LoadingSuggestionCards() {
  return (
    <div className={cardsLayoutClasses}>
      {Array.from({ length: 18 }).map((_, index) => (
        <LoadingUserCard key={index}>
          <div className={buttonLayoutClasses}>
            <div className="skeleton shape-btn" />
          </div>
        </LoadingUserCard>
      ))}
    </div>
  )
}
