import { Pagination } from '@/components/pagination'
import { getBlocks } from '@/utils/api/get-blocks'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

type Props = {
  page: string
}

export async function BlocksPagination({ page }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { pagination } = await getBlocks(currentUser.id.toString(), page)

  return pagination.totalPages > 1 ? <Pagination {...pagination} /> : null
}
