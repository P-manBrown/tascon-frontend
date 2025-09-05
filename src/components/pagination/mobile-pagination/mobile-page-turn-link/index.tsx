import Link from 'next/link'
import { MobilePageTurnLinkLoadingIndicator } from './mobile-page-turn-link-loading-indicator'

type Props = {
  page: number
  className: string
  children: React.ReactNode
}

const shapeClasses = 'rounded-sm'

export function MobilePageTurnLink({ page, className, children }: Props) {
  return (
    <Link
      href={{ query: { page } }}
      className={`inline-flex items-center justify-center border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-100 ${shapeClasses} ${className}`}
      prefetch={false}
    >
      <MobilePageTurnLinkLoadingIndicator>
        {children}
      </MobilePageTurnLinkLoadingIndicator>
    </Link>
  )
}

type LoadingMobilePageTurnLinkProps = {
  className: string
}

export function LoadingMobilePageTurnLink({
  className,
}: LoadingMobilePageTurnLinkProps) {
  return <span className={`skeleton ${shapeClasses} ${className}`} />
}
