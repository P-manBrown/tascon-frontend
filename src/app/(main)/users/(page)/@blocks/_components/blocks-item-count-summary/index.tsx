import {
  ItemCountSummary,
  LoadingItemCountSummary,
} from '@/components/texts/item-count-summary'
import { getBlocks } from '@/utils/api/get-blocks'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

type Props = {
  limit: number
}

const baseClasses = 'max-sm:hidden'

export async function BlocksItemCountSummary({ limit }: Props) {
  const { account: currentUserId } = await getCurrentUser()
  const { blocks, pagination } = await getBlocks({
    page: '1',
    currentUserId: currentUserId.id.toString(),
    limit: limit.toString(),
  })
  const currentCount = Object.keys(blocks).length

  return (
    <ItemCountSummary
      className={baseClasses}
      currentCount={currentCount}
      totalCount={pagination.totalCount}
    />
  )
}

export function LoadingBlocksItemCountSummary() {
  return <LoadingItemCountSummary className={baseClasses} />
}
