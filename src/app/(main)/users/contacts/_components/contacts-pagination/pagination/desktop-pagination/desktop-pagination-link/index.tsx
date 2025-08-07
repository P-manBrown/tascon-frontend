import Link from 'next/link'
import { DesktopPaginationLinkLoadingIndicator } from './desktop-pagination-link-loading-indicator'

type Props = {
  page: number
  className: string
  children: React.ReactNode
}

export function DesktopPaginationLink({ page, className, children }: Props) {
  return (
    <Link
      href={{ query: { page } }}
      className={`border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-100 focus-visible:z-10 ${className}`}
      prefetch={false}
    >
      <DesktopPaginationLinkLoadingIndicator>
        {children}
      </DesktopPaginationLinkLoadingIndicator>
    </Link>
  )
}
