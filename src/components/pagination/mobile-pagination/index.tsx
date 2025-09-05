import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import {
  LoadingMobilePageTurnLink,
  MobilePageTurnLink,
} from './mobile-page-turn-link'
import { PageSelector } from './page-selector'

type Props = {
  currentPage: number
  totalPages: number
  isFirstPage: boolean
  isLastPage: boolean
}

const layoutClasses = 'flex items-center justify-between md:hidden'
const linkSizeClasses = 'h-10 w-16'

export function MobilePagination({
  currentPage,
  totalPages,
  isFirstPage,
  isLastPage,
}: Props) {
  return (
    <nav className={layoutClasses}>
      {isFirstPage ? (
        <span className={linkSizeClasses} />
      ) : (
        <MobilePageTurnLink page={currentPage - 1} className={linkSizeClasses}>
          <ChevronLeftIcon className="size-4" />
          前へ
        </MobilePageTurnLink>
      )}
      <PageSelector currentPage={currentPage} totalPages={totalPages} />
      {isLastPage ? (
        <span className={linkSizeClasses} />
      ) : (
        <MobilePageTurnLink page={currentPage + 1} className={linkSizeClasses}>
          次へ
          <ChevronRightIcon className="size-4" />
        </MobilePageTurnLink>
      )}
    </nav>
  )
}

export function LoadingMobilePagination() {
  return (
    <div className={layoutClasses}>
      <LoadingMobilePageTurnLink className={`skeleton ${linkSizeClasses}`} />
      <span className="skeleton h-5 w-14 rounded-full" />
      <LoadingMobilePageTurnLink className={`skeleton ${linkSizeClasses}`} />
    </div>
  )
}
