import { ChevronDownIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { ScrollTriggerLinkLoadingIndicator } from '../scroll-trigger-link-loading-indicator'

type Props = {
  currentPage: number
  pageItems: string
  linkRef: React.RefObject<HTMLAnchorElement | null>
  pullProgress: number
  shouldTransition: boolean
  onClick: (ev: React.MouseEvent<HTMLAnchorElement>) => void
}

export function ScrollTriggerNextLink({
  currentPage,
  pageItems,
  linkRef,
  pullProgress,
  shouldTransition,
  onClick,
}: Props) {
  const nextPage = currentPage + 1

  const getBackgroundGradient = () => {
    if (pullProgress === 0 || shouldTransition) {
      return 'transparent'
    }

    const color = 'rgba(34, 197, 94, 0.2)'

    return `linear-gradient(to top, ${color} 0%, ${color} ${pullProgress}%, transparent ${pullProgress}%, transparent 100%)`
  }

  return (
    <Link
      ref={linkRef}
      href={{ query: { page: nextPage } }}
      className="flex h-11 w-full justify-between overflow-hidden rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 transition-all duration-200 hover:bg-green-500/20!"
      style={{ background: getBackgroundGradient() }}
      onClick={onClick}
      replace={true}
      prefetch={true}
    >
      <ScrollTriggerLinkLoadingIndicator>
        <ChevronDownIcon className="size-5" />
        次の{pageItems}件を表示
        <ChevronDownIcon className="size-5" />
      </ScrollTriggerLinkLoadingIndicator>
    </Link>
  )
}
