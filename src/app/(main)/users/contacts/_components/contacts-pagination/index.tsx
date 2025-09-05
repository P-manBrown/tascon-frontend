import { Pagination } from '@/components/pagination'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { getContacts } from '../../get-contacts.api'

type Props = {
  page: string
}

export async function ContactsPagination({ page }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { pagination } = await getContacts(page, currentUser.id.toString())

  return pagination.totalPages > 1 ? <Pagination {...pagination} /> : null
}
