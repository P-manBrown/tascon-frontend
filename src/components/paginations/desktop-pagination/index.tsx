import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { ActivePageNumber } from './active-page-number'
import { DesktopPaginationLink } from './desktop-pagination-link'
import { PaginationEllipsis } from './pagination-ellipsis'

type PaginationState = {
  pages: number[]
  isFirstPageVisible: boolean
  isLastPageVisible: boolean
  isStartEllipsisVisible: boolean
  isEndEllipsisVisible: boolean
  isFirstPage: boolean
  isLastPage: boolean
}

type Props = {
  currentPage: number
  pageItems: number
  totalPages: number
  totalCount: number
  paginationState: PaginationState
}

const pageLinkClasses = 'h-10 w-9'
const pageTurnLinkClasses = 'h-10 w-10'
const layoutClasses = 'hidden md:flex md:items-center md:justify-between'
const navLayoutClasses = 'inline-flex'
const leftPageTurnLinkClasses = 'rounded-l-md'
const rightPageTurnLinkClasses = 'rounded-r-md'

export function DesktopPagination({
  currentPage,
  pageItems,
  totalPages,
  totalCount,
  paginationState,
}: Props) {
  const {
    pages,
    isFirstPageVisible,
    isLastPageVisible,
    isStartEllipsisVisible,
    isEndEllipsisVisible,
    isFirstPage,
    isLastPage,
  } = paginationState

  const startItem = (currentPage - 1) * pageItems + 1
  const endItem = Math.min(currentPage * pageItems, totalCount)

  return (
    <div className={layoutClasses}>
      <p className="text-sm text-gray-600">
        <span className="font-medium">{totalCount}</span> 件中{' '}
        <span className="font-medium">{startItem}</span> -{' '}
        <span className="font-medium">{endItem}</span> 件を表示
      </p>
      <nav className={`drop-shadow-sm ${navLayoutClasses}`}>
        {!isFirstPage && (
          <DesktopPaginationLink
            page={currentPage - 1}
            className={`${leftPageTurnLinkClasses} ${pageTurnLinkClasses}`}
          >
            <ChevronLeftIcon className="size-5" />
          </DesktopPaginationLink>
        )}
        {isFirstPageVisible && (
          <>
            {currentPage === 1 ? (
              <ActivePageNumber className={pageLinkClasses}>1</ActivePageNumber>
            ) : (
              <DesktopPaginationLink
                page={1}
                className={`-ml-px ${pageLinkClasses}`}
              >
                1
              </DesktopPaginationLink>
            )}
            {isStartEllipsisVisible && <PaginationEllipsis />}
          </>
        )}
        {pages.map((page) => (
          <Fragment key={page}>
            {currentPage === page ? (
              <ActivePageNumber className={pageLinkClasses}>
                {page}
              </ActivePageNumber>
            ) : (
              <DesktopPaginationLink
                page={page}
                className={`-ml-px ${pageLinkClasses}`}
              >
                {page}
              </DesktopPaginationLink>
            )}
          </Fragment>
        ))}
        {isLastPageVisible && (
          <>
            {isEndEllipsisVisible && <PaginationEllipsis />}
            {currentPage === totalPages ? (
              <ActivePageNumber className={pageLinkClasses}>
                {totalPages}
              </ActivePageNumber>
            ) : (
              <DesktopPaginationLink
                page={totalPages}
                className={`-ml-px ${pageTurnLinkClasses}`}
              >
                {totalPages}
              </DesktopPaginationLink>
            )}
          </>
        )}
        {!isLastPage && (
          <DesktopPaginationLink
            page={currentPage + 1}
            className={`-ml-px ${rightPageTurnLinkClasses} ${pageTurnLinkClasses}`}
          >
            <ChevronRightIcon className="size-5" aria-hidden="true" />
          </DesktopPaginationLink>
        )}
      </nav>
    </div>
  )
}

type LoadingDesktopPaginationProps = {
  maxVisiblePages: number
}

export function LoadingDesktopPagination({
  maxVisiblePages,
}: LoadingDesktopPaginationProps) {
  return (
    <div className={layoutClasses}>
      <span className="skeleton h-5 w-44 rounded-full" />
      <div className={navLayoutClasses}>
        <span
          className={`skeleton ${leftPageTurnLinkClasses} ${pageTurnLinkClasses}`}
        />
        {Array.from({ length: maxVisiblePages }).map((_, index) => (
          <span key={index} className={`skeleton ${pageLinkClasses}`} />
        ))}
        <span
          className={`skeleton ${rightPageTurnLinkClasses} ${pageTurnLinkClasses}`}
        />
      </div>
    </div>
  )
}
