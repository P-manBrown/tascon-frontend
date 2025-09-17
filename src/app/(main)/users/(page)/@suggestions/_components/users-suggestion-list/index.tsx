import {
  SuggestionCards,
  LoadingSuggestionCards,
} from '@/components/cards/suggestion-cards'
import { getSuggestions } from '@/utils/api/get-suggestions'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

const limit = 12
const cardsLayoutClasses = 'grid gap-4 lg:grid-cols-2 xl:grid-cols-3'

type Props = {
  fallback: React.ReactElement
}

export async function UsersSuggestionList({ fallback }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { suggestions } = await getSuggestions({
    page: '1',
    limit: limit.toString(),
  })

  return (
    <div>
      {suggestions.length === 0 ? (
        fallback
      ) : (
        <SuggestionCards
          users={suggestions}
          currentUserId={currentUser.id.toString()}
          className={cardsLayoutClasses}
        />
      )}
    </div>
  )
}

export function LoadingUsersSuggestionList() {
  return <LoadingSuggestionCards limit={limit} className={cardsLayoutClasses} />
}
