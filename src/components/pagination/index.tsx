import {
  DesktopPagination,
  LoadingDesktopPagination,
} from './desktop-pagination'
import { generatePaginationState } from './generate-pagination-state'
import { MobilePagination, LoadingMobilePagination } from './mobile-pagination'

type Props = {
  currentPage: number
  pageItems: number
  totalPages: number
  totalCount: number
}

const containerClasses = 'border-t border-gray-300 px-4 py-3 sm:px-6'
const maxVisiblePages = 5

export function Pagination({
  currentPage,
  pageItems,
  totalPages,
  totalCount,
}: Props) {
  const paginationState = generatePaginationState(
    currentPage,
    totalPages,
    maxVisiblePages,
  )

  return (
    <div className={containerClasses}>
      <MobilePagination
        currentPage={currentPage}
        totalPages={totalPages}
        isFirstPage={paginationState.isFirstPage}
        isLastPage={paginationState.isLastPage}
      />
      <DesktopPagination
        currentPage={currentPage}
        pageItems={pageItems}
        totalPages={totalPages}
        totalCount={totalCount}
        paginationState={paginationState}
      />
    </div>
  )
}

export function LoadingPagination() {
  return (
    <div className={containerClasses}>
      <LoadingMobilePagination />
      <LoadingDesktopPagination maxVisiblePages={maxVisiblePages} />
    </div>
  )
}
