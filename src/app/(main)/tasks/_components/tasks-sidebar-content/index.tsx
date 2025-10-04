import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { SidebarHeading } from '@/components/headings/sidebar-heading'
import { TaskGroupMenu, LoadingTaskGroupMenu } from './task-group-menu'
import { TaskGroupsError } from './task-groups-error'

export function TasksSidebarContent() {
  return (
    <div>
      <ErrorBoundary FallbackComponent={TaskGroupsError}>
        <SidebarHeading>グループ</SidebarHeading>
        <div className="mt-2 md:mt-1">
          <Suspense fallback={<LoadingTaskGroupMenu />}>
            <TaskGroupMenu />
          </Suspense>
        </div>
      </ErrorBoundary>
    </div>
  )
}
