import { ChevronDownIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { ReadonlyURLSearchParams } from 'next/navigation'
import { Fragment, useEffect, useRef, useState } from 'react'
import { SearchParamsLoader } from '@/components/search-params-loader'
import { PageSelectorLoadingIndicator } from './page-selector-loading-indicator'

type Props = {
  linkRef?: React.RefObject<HTMLAnchorElement>
  currentPage: number
  totalPages: number
  onClick?: (ev: React.MouseEvent<HTMLAnchorElement>) => void
}

const pageNumberClasses = 'h-7 text-center text-sm'

export function PageSelector({
  linkRef,
  currentPage,
  totalPages,
  onClick,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [params, setParams] = useState<ReadonlyURLSearchParams | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const currentPageRef = useRef<HTMLDivElement>(null)

  const handleButtonClick = () => {
    setIsOpen((prev) => !prev)
  }

  const handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleParamsReceived = (searchParams: ReadonlyURLSearchParams) => {
    setParams(searchParams)
  }

  const handleClickOutside = (ev: MouseEvent) => {
    const isNode = ev.target instanceof Node
    const isOutside = isNode && !ref.current?.contains(ev.target)

    if (isOutside) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside, true)

      if (currentPageRef.current) {
        currentPageRef.current.scrollIntoView({
          block: 'center',
          behavior: 'instant',
        })
      }

      return () => {
        document.removeEventListener('click', handleClickOutside, true)
      }
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [params])

  return (
    <>
      <div
        ref={ref}
        onKeyDown={handleKeyDown}
        className={isOpen ? 'relative' : undefined}
      >
        {isOpen && (
          <div className="absolute bottom-full left-1/2 z-10 max-h-32 w-16 -translate-x-1/2 overflow-y-auto rounded-sm border border-gray-300 bg-white shadow-md">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Fragment key={page}>
                {page === currentPage ? (
                  <div
                    ref={currentPageRef}
                    className={`flex items-center justify-center bg-blue-50 font-medium text-blue-600 ${pageNumberClasses}`}
                  >
                    {page}
                  </div>
                ) : (
                  <Link
                    ref={linkRef}
                    href={{ query: { page } }}
                    className={`block text-gray-600 hover:bg-gray-100 ${pageNumberClasses}`}
                    onClick={onClick}
                    prefetch={false}
                  >
                    <PageSelectorLoadingIndicator>
                      {page}
                    </PageSelectorLoadingIndicator>
                  </Link>
                )}
              </Fragment>
            ))}
          </div>
        )}
        <button
          onClick={handleButtonClick}
          className="flex items-center gap-1 p-2.5 text-sm font-medium text-gray-600"
        >
          <span>
            {currentPage} / {totalPages}
          </span>
          <ChevronDownIcon
            className={`size-3 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
      <SearchParamsLoader onParamsReceived={handleParamsReceived} />
    </>
  )
}
