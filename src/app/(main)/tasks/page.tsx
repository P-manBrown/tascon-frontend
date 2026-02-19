import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { CalendarError } from '@/components/calendars/calendar-error'
import { TaskCalendar } from '@/components/calendars/task-calendar'
import { TasksHeading } from '@/components/headings/tasks-heading'
import { DesktopTaskCalendarLayout } from '@/components/layouts/task-calendar-layout'
import { TaskListLayout } from '@/components/layouts/task-list-layout'
import TasksLayout from '@/components/layouts/tasks-layout'
import { LoadingTaskList, TaskList } from '@/components/task-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'すべてのタスク一覧',
}

type Props = {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function Tasks({ searchParams }: Props) {
  const params = await searchParams
  const { page = '1' } = params

  return (
    <TasksLayout>
      <TasksHeading>すべてのタスク</TasksHeading>
      <TaskListLayout>
        <Suspense fallback={<LoadingTaskList />}>
          <TaskList page={page} />
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
