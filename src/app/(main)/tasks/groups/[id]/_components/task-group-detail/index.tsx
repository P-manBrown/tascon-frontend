import { Suspense } from 'react'
import {
  EditableTaskGroupIcon,
  LoadingEditableTaskGroupIcon,
} from './task-group-detail-icon/editable-task-group-icon'
import {
  EditableTaskGroupName,
  LoadingEditableTaskGroupName,
} from './task-group-name/editable-task-group-name'
import {
  EditableTaskGroupNote,
  LoadingEditableTaskGroupNote,
} from './task-group-note/editable-task-group-note'

type Props = {
  id: string
}

export function TaskGroupDetail({ id }: Props) {
  return (
    <div className="md:w-[40rem]">
      <div className="flex flex-col gap-y-10">
        <Suspense fallback={<LoadingEditableTaskGroupIcon />}>
          <EditableTaskGroupIcon taskGroupId={id} />
        </Suspense>
        <Suspense fallback={<LoadingEditableTaskGroupName />}>
          <EditableTaskGroupName taskGroupId={id} />
        </Suspense>
        <Suspense fallback={<LoadingEditableTaskGroupNote />}>
          <EditableTaskGroupNote taskGroupId={id} />
        </Suspense>
      </div>
    </div>
  )
}
