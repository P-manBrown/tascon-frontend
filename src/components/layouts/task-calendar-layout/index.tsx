'use client'

import { useMediaQuery } from '@/utils/media-query/use-media-query'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function DesktopTaskCalendarLayout({ children }: Props) {
  const { isMatch: isDesktop } = useMediaQuery('(min-width: 768px)')

  return isDesktop ? (
    <div className="h-full min-w-0 flex-1">{children}</div>
  ) : null
}
