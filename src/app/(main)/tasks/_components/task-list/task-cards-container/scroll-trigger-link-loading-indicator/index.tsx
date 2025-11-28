import { useLinkStatus } from 'next/link'

type Props = {
  children: React.ReactNode
}

export function ScrollTriggerLinkLoadingIndicator({ children }: Props) {
  const { pending } = useLinkStatus()

  return (
    <span
      className={`relative inline-flex h-full w-full items-center justify-between overflow-hidden px-4 ${
        pending ? 'cursor-wait' : ''
      }`}
    >
      {pending && (
        <span className="absolute left-1/2 block size-2/3 -translate-x-1/2 animate-ping rounded-full bg-green-500/20" />
      )}
      {children}
    </span>
  )
}
