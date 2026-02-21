import { Suspense } from 'react'
import { LoadingTaskGroupNameHeading } from '@/components/headings/task-group-name-heading'
import TasksLayout from '@/components/layouts/tasks-layout'
import {
  LoadingSharedTaskGroupDetail,
  SharedTaskGroupDetail,
} from './_components/shared-task-group-detail'
import {
  LoadingSharedTaskGroupHeaderIcon,
  SharedTaskGroupHeaderIcon,
} from './_components/shared-task-group-header-icon'
import { SharedTaskGroupHeading } from './_components/shared-task-group-heading'
import {
  LoadingSharedTaskGroupOwner,
  SharedTaskGroupOwner,
} from './_components/shared-task-group-owner'
import { ShowTaskGroupDetailModalButton } from '../../groups/[id]/_components/show-task-group-detail-modal-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '共有タスクグループ詳細',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function SharedTaskGroup(props: Props) {
  const params = await props.params
  const { id } = params

  return (
    <TasksLayout>
      <div className="flex items-center justify-between gap-x-5">
        <div className="flex min-w-0 items-center gap-x-3">
          <Suspense fallback={<LoadingSharedTaskGroupHeaderIcon />}>
            <SharedTaskGroupHeaderIcon id={id} />
          </Suspense>
          <Suspense fallback={<LoadingTaskGroupNameHeading />}>
            <SharedTaskGroupHeading id={id} />
          </Suspense>
        </div>
        <div className="flex flex-none items-center gap-x-3">
          <Suspense fallback={<LoadingSharedTaskGroupOwner />}>
            <SharedTaskGroupOwner id={id} />
          </Suspense>
          <ShowTaskGroupDetailModalButton
            modalContent={
              <Suspense fallback={<LoadingSharedTaskGroupDetail />}>
                <SharedTaskGroupDetail id={id} />
              </Suspense>
            }
          />
        </div>
      </div>
    </TasksLayout>
  )
}
