'use client'

import { RectangleStackIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useContext } from 'react'
import { LinkSidebarQueryContext } from '@/components/sidebar/link-sidebar-query-context'

const links = [
  {
    icon: <RectangleStackIcon className="size-5" />,
    name: 'すべて',
    pathname: '/tasks',
  },
]

export function TasksMenu() {
  const sidebarQuery = useContext(LinkSidebarQueryContext)
  const segment = useSelectedLayoutSegment()
  const currentPath = segment === null ? `/tasks` : `/tasks/${segment}`

  return (
    <nav>
      <ul className="space-y-2 md:space-y-1">
        {links.map((link) => {
          const isActive = link.pathname === currentPath
          return (
            <li key={link.name}>
              <Link
                key={link.name}
                href={{ pathname: link.pathname, query: sidebarQuery }}
                className={`flex w-full items-center gap-x-1.5 rounded-sm px-4 py-1 ${
                  isActive
                    ? 'pointer-events-none relative bg-gray-600/10 text-black before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:rounded-sm before:bg-gray-600 before:content-[""]'
                    : 'duration-200 hover:bg-gray-600/10 hover:text-black'
                }`}
                prefetch={isActive ? false : null}
                tabIndex={isActive ? -1 : undefined}
              >
                {link.icon}
                {link.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
