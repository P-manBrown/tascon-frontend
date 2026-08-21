'use client'

import { useSelectedLayoutSegments } from 'next/navigation'
import { useContext } from 'react'
import { LinkSidebarQueryContext } from '@/components/sidebar/link-sidebar-query-context'
import { SharedTaskGroupLink } from './shared-task-group-link'

type Props = {
  taskGroupShares: Array<{
    id: number
    taskGroup: Pick<
      React.ComponentProps<typeof SharedTaskGroupLink>,
      'name' | 'icon' | 'owner'
    >
  }>
  className?: string
  linkSizeClasses: string
}

export function SharedTaskGroupNavLinks({
  taskGroupShares,
  className,
  linkSizeClasses,
}: Props) {
  const linkSidebarQuery = useContext(LinkSidebarQueryContext)
  const segments = useSelectedLayoutSegments()
  const currentPath = `/tasks/${segments.join('/')}`

  return (
    <ul className={className}>
      {taskGroupShares.map((taskGroupShare) => {
        return (
          <li key={taskGroupShare.id}>
            <SharedTaskGroupLink
              shareId={taskGroupShare.id.toString()}
              name={taskGroupShare.taskGroup.name}
              icon={taskGroupShare.taskGroup.icon}
              owner={taskGroupShare.taskGroup.owner}
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
