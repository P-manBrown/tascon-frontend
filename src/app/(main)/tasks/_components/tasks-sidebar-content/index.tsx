import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { SidebarHeading } from '@/components/headings/sidebar-heading'
import { CreateTaskGroupButton } from './create-task-group-button'
import {
  SharedTaskGroupMenu,
  LoadingSharedTaskGroupMenu,
} from './shared-task-group-menu'
import { SharedTaskGroupsError } from './shared-task-groups-error'
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
      <div className="mt-4">
        <SidebarHeading>共有グループ</SidebarHeading>
        <ErrorBoundary FallbackComponent={SharedTaskGroupsError}>
          <div className="mt-2 md:mt-1">
            <Suspense fallback={<LoadingSharedTaskGroupMenu />}>
              <SharedTaskGroupMenu />
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  )
}
