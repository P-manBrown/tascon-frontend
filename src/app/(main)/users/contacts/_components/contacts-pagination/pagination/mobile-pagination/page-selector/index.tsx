'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Fragment, useEffect, useRef, useState } from 'react'
import { PageSelectorLoadingIndicator } from './page-selector-loading-indicator'

type Props = {
  currentPage: number
  totalPages: number
}

const pageNumberClasses = 'h-7 text-center text-sm'

export function PageSelector({ currentPage, totalPages }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentPageRef = useRef<HTMLDivElement>(null)

  const handleButtonClick = () => {
    setIsOpen((prev) => !prev)
  }

  function handleKeyDown(ev: React.KeyboardEvent<HTMLDivElement>) {
    if (ev.key === 'Escape') {
      setIsOpen(false)
    }
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
    }

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [isOpen])

  return (
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
                  href={{ query: { page } }}
                  className={`block text-gray-600 hover:bg-gray-100 ${pageNumberClasses}`}
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
  )
}
