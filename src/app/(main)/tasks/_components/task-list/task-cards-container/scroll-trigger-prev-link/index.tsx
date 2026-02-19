import { ChevronUpIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { ScrollTriggerLinkLoadingIndicator } from '../scroll-trigger-link-loading-indicator'

type Props = {
  currentPage: number
  pageItems: string
  linkRef: React.RefObject<HTMLAnchorElement | null>
  pullProgress: number
  shouldTransition: boolean
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

export function ScrollTriggerPrevLink({
  currentPage,
  pageItems,
  linkRef,
  pullProgress,
  shouldTransition,
  onClick,
}: Props) {
  const prevPage = currentPage - 1

  const getBackgroundGradient = () => {
    if (pullProgress === 0 || shouldTransition) {
      return 'transparent'
    }

    const color = 'rgba(34, 197, 94, 0.2)'

    return `linear-gradient(to bottom, ${color} 0%, ${color} ${pullProgress}%, transparent ${pullProgress}%, transparent 100%)`
  }

  return (
    <Link
      ref={linkRef}
      href={{ query: { page: prevPage } }}
      className="flex h-11 w-full justify-between overflow-hidden rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 transition-all duration-200 hover:bg-green-500/20!"
      style={{ background: getBackgroundGradient() }}
      onClick={onClick}
      replace={true}
      prefetch={true}
    >
      <ScrollTriggerLinkLoadingIndicator>
        <ChevronUpIcon className="size-5" />
        前の{pageItems}件を表示
        <ChevronUpIcon className="size-5" />
      </ScrollTriggerLinkLoadingIndicator>
    </Link>
  )
}
