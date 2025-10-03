import { Suspense } from 'react'
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
}

export default async function TaskGroup(props: Props) {
  const params = await props.params
  const { id } = params

  return (
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
  )
}
