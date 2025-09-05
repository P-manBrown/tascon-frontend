import { Pagination } from '@/components/pagination'
import { getSuggestions } from '@/utils/api/get-suggestions'

type Props = {
  page: string
}

export async function SuggestionsPagination({ page }: Props) {
  const { pagination } = await getSuggestions(page)

  return pagination.totalPages > 1 ? <Pagination {...pagination} /> : null
}
