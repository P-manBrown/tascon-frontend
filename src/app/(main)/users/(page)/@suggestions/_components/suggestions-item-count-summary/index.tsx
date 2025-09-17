import {
  ItemCountSummary,
  LoadingItemCountSummary,
} from '@/components/texts/item-count-summary'
import { getSuggestions } from '@/utils/api/get-suggestions'

type Props = {
  limit: number
}

const baseClasses = 'max-sm:hidden'

export async function SuggestionsItemCountSummary({ limit }: Props) {
  const { suggestions, pagination } = await getSuggestions({
    page: '1',
    limit: limit.toString(),
  })
  const currentCount = Object.keys(suggestions).length

  return (
    <ItemCountSummary
      className={baseClasses}
      currentCount={currentCount}
      totalCount={pagination.totalCount}
    />
  )
}

export function LoadingSuggestionsItemCountSummary() {
  return <LoadingItemCountSummary className={baseClasses} />
}
