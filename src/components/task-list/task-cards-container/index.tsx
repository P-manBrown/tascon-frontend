'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRef, useEffect } from 'react'
import { PageSelector } from '@/components/paginations/page-selector'
import { CalendarButton } from './calendar-button'
import { ScrollTriggerNextLink } from './scroll-trigger-next-link'
import { useScrollTriggerNextLink } from './scroll-trigger-next-link/use-scroll-trigger-next-link'
import { ScrollTriggerPrevLink } from './scroll-trigger-prev-link'
import { useScrollTriggerPrevLink } from './scroll-trigger-prev-link/use-scroll-trigger-prev-link'

type Props = {
  taskGroupId?: string
  currentPage: number
  totalPages: number
  pageItems: string
  className: string
  children: React.ReactNode
}

const wheelTransitionThreshold = 1000
const touchTransitionThreshold = 500

export function TaskCardsContainer({
  taskGroupId,
  currentPage,
  totalPages,
  pageItems,
  className,
  children,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isPageTurnLinkClickedRef = useRef(false)
  const isPageSelectLinkClickedRef = useRef(false)
  const currentPageRef = useRef(currentPage)

  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const nextPageHook = useScrollTriggerNextLink({
    hasNextPage,
    wheelTransitionThreshold,
    touchTransitionThreshold,
  })

  const prevPageHook = useScrollTriggerPrevLink({
    hasPrevPage,
    wheelTransitionThreshold,
    touchTransitionThreshold,
  })

  const handleWheel = (ev: React.WheelEvent<HTMLDivElement>) => {
    nextPageHook.handleWheel(ev)
    prevPageHook.handleWheel(ev)
  }

  const handleTouchStart = (ev: React.TouchEvent<HTMLDivElement>) => {
    nextPageHook.handleTouchStart(ev)
    prevPageHook.handleTouchStart(ev)
  }

  const handleTouchMove = (ev: React.TouchEvent<HTMLDivElement>) => {
    nextPageHook.handleTouchMove(ev)
    prevPageHook.handleTouchMove(ev)
  }

  const handlePageTurnLinkClick = () => {
    isPageTurnLinkClickedRef.current = true
    isPageSelectLinkClickedRef.current = false
  }

  const handlePageSelectLinkClick = () => {
    isPageSelectLinkClickedRef.current = true
    isPageTurnLinkClickedRef.current = false
  }

  useEffect(() => {
    if (isPageTurnLinkClickedRef.current) {
      if (currentPage > currentPageRef.current) {
        prevPageHook.linkRef.current?.scrollIntoView()
      } else if (currentPage < currentPageRef.current) {
        nextPageHook.linkRef.current?.scrollIntoView()
      }
      isPageTurnLinkClickedRef.current = false
    } else if (isPageSelectLinkClickedRef.current) {
      scrollContainerRef.current?.scrollTo(0, 0)
      isPageSelectLinkClickedRef.current = false
    }
    currentPageRef.current = currentPage
  }, [currentPage, prevPageHook.linkRef, nextPageHook.linkRef])

  return (
    <div
      className={`bg-theme flex flex-col border border-gray-300 ${className}`}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-300"></div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-y-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="min-h-[calc(100%+2.75rem)]">
          {hasPrevPage && (
            <ScrollTriggerPrevLink
              currentPage={currentPage}
              pageItems={pageItems}
              linkRef={prevPageHook.linkRef}
              pullProgress={prevPageHook.pullProgress}
              shouldTransition={prevPageHook.shouldTransition}
              onClick={handlePageTurnLinkClick}
            />
          )}
          {children}
          {hasNextPage && (
            <ScrollTriggerNextLink
              currentPage={currentPage}
              pageItems={pageItems}
              linkRef={nextPageHook.linkRef}
              pullProgress={nextPageHook.pullProgress}
              shouldTransition={nextPageHook.shouldTransition}
              onClick={handlePageTurnLinkClick}
            />
          )}
        </div>
      </div>
      <div className="relative flex h-12 shrink-0 items-center justify-center border-t border-gray-300">
        <Link
          href={{
            pathname: '/tasks/create',
            ...(taskGroupId !== undefined && {
              query: { task_group_id: taskGroupId },
            }),
          }}
          className="btn-icon absolute left-4"
        >
          <PlusIcon className="size-5 stroke-2" />
        </Link>
        {totalPages > 1 && (
          <PageSelector
            currentPage={currentPage}
            totalPages={totalPages}
            onClick={handlePageSelectLinkClick}
          />
        )}
        <CalendarButton />
      </div>
    </div>
  )
}
