import { Suspense } from 'react'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import {
  LoadingTaskGroupDetailIcon,
  TaskGroupDetailIcon,
} from './task-group-detail-icon'
import { LoadingTaskGroupName, TaskGroupName } from './task-group-name'
import { LoadingTaskGroupNote, TaskGroupNote } from './task-group-note'
import { TaskGroupNoteCollapsibleSection } from './task-group-note-collapsible-section'

type Props = {
  id: string
}

export function TaskGroupDetail({ id }: Props) {
  return (
    <div className="md:w-[40rem]">
      <div className="flex flex-col space-y-10">
        <DetailItemHeadingLayout>
          <DetailItemHeading>アイコン</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <Suspense fallback={<LoadingTaskGroupDetailIcon />}>
            <TaskGroupDetailIcon id={id} />
          </Suspense>
        </DetailItemContentLayout>
        <DetailItemHeadingLayout>
          <DetailItemHeading>グループ名</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <Suspense fallback={<LoadingTaskGroupName />}>
            <TaskGroupName id={id} />
          </Suspense>
        </DetailItemContentLayout>
        <DetailItemHeadingLayout>
          <DetailItemHeading>メモ</DetailItemHeading>
        </DetailItemHeadingLayout>
        <TaskGroupNoteCollapsibleSection>
          <DetailItemContentLayout>
            <Suspense fallback={<LoadingTaskGroupNote />}>
              <TaskGroupNote id={id} />
            </Suspense>
          </DetailItemContentLayout>
        </TaskGroupNoteCollapsibleSection>
      </div>
    </div>
  )
}
