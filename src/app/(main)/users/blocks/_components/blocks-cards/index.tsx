import { EmptyList } from '@/components/empty-list'
import { UserCard, LoadingUserCard } from '@/components/user-card'
import { getBlocks } from '@/utils/api/get-blocks'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { DeleteBlockButton } from './delete-block-button'

type Props = {
  page: string
}

const cardsLayoutClasses =
  'grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
const buttonLayoutClasses = 'relative z-10 mt-4'

export async function BlocksCards({ page }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { blocks } = await getBlocks(currentUser.id.toString(), page)

  return blocks.length === 0 ? (
    <div className="my-28 md:my-48">
      <EmptyList description="ブロックしているユーザーは存在しません。" />
    </div>
  ) : (
    <div className={cardsLayoutClasses}>
      {blocks.map((block) => (
        <UserCard
          key={block.blocked.id}
          id={block.blocked.id}
          name={block.blocked.name}
          bio={block.blocked.bio}
          avatarUrl={block.blocked.avatarUrl}
        >
          <div className={buttonLayoutClasses}>
            <DeleteBlockButton blockId={block.id} />
          </div>
        </UserCard>
      ))}
    </div>
  )
}

export function LoadingBlocksCards() {
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
