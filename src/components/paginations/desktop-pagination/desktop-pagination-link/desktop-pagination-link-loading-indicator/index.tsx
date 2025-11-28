'use client'

import { useLinkStatus } from 'next/link'

type Props = {
  children: React.ReactNode
}

export function DesktopPaginationLinkLoadingIndicator({ children }: Props) {
  const { pending } = useLinkStatus()

  return (
    <span
      className={`relative inline-flex h-full w-full items-center justify-center overflow-hidden ${
        pending ? 'cursor-wait' : ''
      }`}
    >
      {pending && (
        <span className="absolute inset-0 block animate-ping rounded-full bg-gray-500/20" />
      )}
      {children}
    </span>
  )
}
