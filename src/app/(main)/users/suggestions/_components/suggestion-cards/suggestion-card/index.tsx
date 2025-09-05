import { UserCard, LoadingUserCard } from '@/components/user-card'

type Props = {
  id: number
  name: string
  bio?: string
  avatarUrl?: string
}

export function SuggestionCard({ id, name, bio, avatarUrl }: Props) {
  return <UserCard id={id} name={name} bio={bio} avatarUrl={avatarUrl} />
}

export function LoadingSuggestionCard() {
  return <LoadingUserCard />
}
