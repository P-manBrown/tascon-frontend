import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { SidebarHeading } from '@/components/headings/sidebar-heading'
import { CreateTaskGroupButton } from './create-task-group-button'
import { TaskGroupMenu, LoadingTaskGroupMenu } from './task-group-menu'
import { TaskGroupsError } from './task-groups-error'
import { TasksMenu } from './tasks-menu'

export function TasksSidebarContent() {
  return (
    <div>
      <SidebarHeading>タスク</SidebarHeading>
      <div className="mt-2 md:mt-1">
        <TasksMenu />
      </div>
      <div className="mt-4">
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
    </div>
  )
}
