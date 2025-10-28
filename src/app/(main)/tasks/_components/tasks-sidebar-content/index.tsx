import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { SidebarHeading } from '@/components/headings/sidebar-heading'
import { CreateTaskGroupButton } from './create-task-group-button'
import { TaskGroupMenu, LoadingTaskGroupMenu } from './task-group-menu'
import { TaskGroupsError } from './task-groups-error'

export function TasksSidebarContent() {
  return (
    <div>
      <ErrorBoundary FallbackComponent={TaskGroupsError}>
        <div className="flex items-center justify-between">
          <SidebarHeading>グループ</SidebarHeading>
          <CreateTaskGroupButton />
        </div>
        <div className="mt-2 md:mt-1">
          <Suspense fallback={<LoadingTaskGroupMenu />}>
            <TaskGroupMenu />
          </Suspense>
        </div>
      </ErrorBoundary>
    </div>
  )
}
