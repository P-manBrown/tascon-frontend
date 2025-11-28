import { Suspense } from 'react'
import { TasksHeading } from '@/components/headings/tasks-heading'
import { TaskListLayout } from '@/components/layouts/task-list-layout'
import TasksLayout from '@/components/layouts/tasks-layout'
import { LoadingTaskList, TaskList } from '@/components/task-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '今日のタスク一覧',
}

type Props = {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function TodayTasks({ searchParams }: Props) {
  const params = await searchParams
  const { page = '1' } = params

  return (
    <TasksLayout>
      <TasksHeading>今日のタスク</TasksHeading>
      <TaskListLayout>
        <Suspense fallback={<LoadingTaskList />}>
          <TaskList page={page} filter="actionable" />
        </Suspense>
      </TaskListLayout>
    </TasksLayout>
  )
}
