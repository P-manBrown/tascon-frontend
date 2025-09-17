import { BlockCards, LoadingBlockCards } from '@/components/cards/block-cards'
import { getBlocks } from '@/utils/api/get-blocks'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

const cardsLayoutClasses =
  'grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'

type Props = {
  limit: number
  fallback: React.ReactElement
}

export async function UsersBlockList({ limit, fallback }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { blocks } = await getBlocks({
    currentUserId: currentUser.id.toString(),
    page: '1',
    limit: limit.toString(),
  })

  return (
    <div>
      {blocks.length === 0 ? (
        fallback
      ) : (
        <BlockCards blocks={blocks} className={cardsLayoutClasses} />
      )}
    </div>
  )
}

type LoadingUsersBlockListProps = Pick<
  React.ComponentProps<typeof LoadingBlockCards>,
  'limit'
>

export function LoadingUsersBlockList({ limit }: LoadingUsersBlockListProps) {
  return <LoadingBlockCards limit={limit} className={cardsLayoutClasses} />
}
