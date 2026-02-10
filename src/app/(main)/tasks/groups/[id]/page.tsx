import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { CalendarError } from '@/components/calendars/calendar-error'
import { TaskCalendar } from '@/components/calendars/task-calendar'
import { DesktopTaskCalendarLayout } from '@/components/layouts/task-calendar-layout'
import { TaskListLayout } from '@/components/layouts/task-list-layout'
import TasksLayout from '@/components/layouts/tasks-layout'
import { LoadingTaskList, TaskList } from '@/components/task-list'
import { ShowTaskGroupDetailModalButton } from './_components/show-task-group-detail-modal-button'
import { TaskGroupDetail } from './_components/task-group-detail'
import {
  LoadingTaskGroupHeaderIcon,
  TaskGroupHeaderIcon,
} from './_components/task-group-header-icon'
import {
  LoadingTaskGroupHeading,
  TaskGroupHeading,
} from './_components/task-group-heading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'タスクグループ詳細',
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    page?: string
  }>
}

export default async function TaskGroup(props: Props) {
  const params = await props.params
  const { id } = params
  const searchParams = await props.searchParams
  const { page = '1' } = searchParams

  return (
    <TasksLayout>
      <div className="flex items-center justify-between gap-x-5">
        <div className="flex min-w-0 items-center gap-x-3">
          <Suspense fallback={<LoadingTaskGroupHeaderIcon />}>
            <TaskGroupHeaderIcon id={id} />
          </Suspense>
          <Suspense fallback={<LoadingTaskGroupHeading />}>
            <TaskGroupHeading id={id} />
          </Suspense>
        </div>
        <ShowTaskGroupDetailModalButton
          modalContent={<TaskGroupDetail id={id} />}
        />
      </div>
      <TaskListLayout>
        <Suspense fallback={<LoadingTaskList />}>
          <TaskList page={page} taskGroupId={id} />
        </Suspense>
        <DesktopTaskCalendarLayout>
          <ErrorBoundary FallbackComponent={CalendarError}>
            <TaskCalendar />
          </ErrorBoundary>
        </DesktopTaskCalendarLayout>
      </TaskListLayout>
    </TasksLayout>
  )
}
