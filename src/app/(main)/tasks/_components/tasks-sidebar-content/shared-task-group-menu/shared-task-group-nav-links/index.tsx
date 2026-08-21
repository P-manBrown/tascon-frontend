'use client'

import { useSelectedLayoutSegments } from 'next/navigation'
import { useContext } from 'react'
import { LinkSidebarQueryContext } from '@/components/sidebar/link-sidebar-query-context'
import { SharedTaskGroupLink } from './shared-task-group-link'

type Props = {
  taskGroups: Array<
    Pick<
      React.ComponentProps<typeof SharedTaskGroupLink>,
      'id' | 'name' | 'icon' | 'owner'
    >
  >
  className?: string
  linkSizeClasses: string
}

export function SharedTaskGroupNavLinks({
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
            <SharedTaskGroupLink
              id={taskGroup.id}
              name={taskGroup.name}
              icon={taskGroup.icon}
              owner={taskGroup.owner}
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
