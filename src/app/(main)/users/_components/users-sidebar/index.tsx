'use client'

import { SidebarHeading } from '@/components/headings/sidebar-heading'
import { Sidebar } from '@/components/sidebar'
import { useSidebar } from '@/components/sidebar/use-sidebar'
import { UsersMenu } from './users-menu'

export function UsersSidebar() {
  const { isOpen, linkSidebarQuery, openSidebar, closeSidebar } = useSidebar({
    defaultState: 'closed',
  })

  return (
    <Sidebar
      isOpen={isOpen}
      onOpenButtonClick={openSidebar}
      onCloseButtonClick={closeSidebar}
    >
      <SidebarHeading>ユーザー</SidebarHeading>
      <div className="mt-2 md:mt-1">
        <UsersMenu sidebarQuery={linkSidebarQuery} />
      </div>
    </Sidebar>
  )
}
