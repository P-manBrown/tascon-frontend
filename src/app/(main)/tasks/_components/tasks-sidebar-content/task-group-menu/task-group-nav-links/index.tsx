'use client'

import { useSelectedLayoutSegments } from 'next/navigation'
import { useContext } from 'react'
import { LinkSidebarQueryContext } from '@/components/sidebar/link-sidebar-query-context'
import { TaskGroupLink } from './task-group-link'

type Props = {
  taskGroups: Array<
    Pick<React.ComponentProps<typeof TaskGroupLink>, 'id' | 'name' | 'icon'>
  >
  className?: string
  linkSizeClasses: string
}

export function TaskGroupNavLinks({
  taskGroups,
  className,
  linkSizeClasses,
}: Props) {
  const linkSidebarQuery = useContext(LinkSidebarQueryContext)
  const segments = useSelectedLayoutSegments()
  const currentPath = `/tasks/${segments.join('/')}`

  return (
    <ul className={className}>
      {taskGroups.map((taskGroup) => {
        return (
          <li key={taskGroup.id}>
            <TaskGroupLink
              id={taskGroup.id}
              name={taskGroup.name}
              icon={taskGroup.icon}
              currentPath={currentPath}
              sidebarQuery={linkSidebarQuery}
              className={linkSizeClasses}
            />
          </li>
        )
      })}
    </ul>
  )
}
