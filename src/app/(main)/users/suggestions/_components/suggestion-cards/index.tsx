import { EmptyList } from '@/components/empty-list'
import { getSuggestions } from '@/utils/api/get-suggestions'
import { SuggestionCard, LoadingSuggestionCard } from './suggestion-card'

type Props = {
  page: string
}

const layoutClasses =
  'grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'

export async function SuggestionCards({ page }: Props) {
  const { users } = await getSuggestions(page)

  return users.length === 0 ? (
    <div className="my-28 md:my-48">
      <EmptyList description="関係のあるユーザーは存在しません。" />
    </div>
  ) : (
    <div className={layoutClasses}>
      {users.map((user) => (
        <SuggestionCard
          key={user.id}
          id={user.id}
          name={user.name}
          bio={user.bio}
          avatarUrl={user.avatarUrl}
        />
      ))}
    </div>
  )
}

export function LoadingSuggestionCards() {
  return (
    <div className={layoutClasses}>
      {Array.from({ length: 18 }).map((_, index) => (
        <LoadingSuggestionCard key={index} />
      ))}
    </div>
  )
}
