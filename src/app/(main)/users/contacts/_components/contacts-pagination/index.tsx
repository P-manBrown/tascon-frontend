import { Pagination } from './pagination'
import { getContacts } from '../../get-contacts.api'

type Props = {
  page: string
}

export async function ContactsPagination({ page }: Props) {
  const { pagination } = await getContacts(page)

  return pagination.totalPages > 1 ? <Pagination {...pagination} /> : null
}
