'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

type Props = {
  children: React.ReactElement
}

export function AccountLink({ children }: Props) {
  const segment = useSelectedLayoutSegment()
  const isActive = `/${segment}` === '/account'

  return (
    <Link
      href="/account"
      className={`clickable-avatar ${
        isActive ? 'pointer-events-none ring ring-gray-500' : ''
      }`}
      aria-label="アカウント"
      prefetch={!isActive}
      tabIndex={isActive ? -1 : undefined}
    >
      {children}
    </Link>
  )
}
