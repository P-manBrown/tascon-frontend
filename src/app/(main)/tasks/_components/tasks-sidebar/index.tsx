'use client'

import { Sidebar } from '@/components/sidebar'
import { LinkSidebarQueryContext } from '@/components/sidebar/link-sidebar-query-context'
import { useSidebar } from '@/components/sidebar/use-sidebar'

type Props = {
  children: React.ReactNode
}

export function TasksSidebar({ children }: Props) {
  const { isOpen, openSidebar, closeSidebar, linkSidebarQuery } = useSidebar({
    defaultState: 'open',
  })

  return (
    <Sidebar
      isOpen={isOpen}
      onOpenButtonClick={openSidebar}
      onCloseButtonClick={closeSidebar}
    >
      <LinkSidebarQueryContext value={linkSidebarQuery}>
        {children}
      </LinkSidebarQueryContext>
    </Sidebar>
  )
}
