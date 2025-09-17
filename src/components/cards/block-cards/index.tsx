import { UserCard, LoadingUserCard } from '@/components/cards/user-card'
import { DeleteBlockButton } from './delete-block-button'

type Props = {
  blocks: Array<{
    id: number
    blocked: Omit<React.ComponentProps<typeof UserCard>, 'children'>
  }>
  className: string
}

const buttonLayoutClasses = 'relative z-10 mt-4'

export function BlockCards({ blocks, className }: Props) {
  return (
    <div className={className}>
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

type LoadingBlockCardsProps = Pick<Props, 'className'> & {
  limit: number
}

export function LoadingBlockCards({
  limit,
  className,
}: LoadingBlockCardsProps) {
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
