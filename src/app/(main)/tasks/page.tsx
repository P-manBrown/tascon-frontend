import { Suspense } from 'react'
import { LoadingTaskList, TaskList } from './_components/task-list'
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
    <div className="flex h-full flex-col">
      <h1 className="text-2xl font-bold">すべてのタスク</h1>
      <div className="h-full min-h-0 pt-3">
        <Suspense fallback={<LoadingTaskList />}>
          <TaskList page={page} />
        </Suspense>
      </div>
    </div>
  )
}
