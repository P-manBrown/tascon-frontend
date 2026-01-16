import { Suspense } from 'react'
import {
  EditableTaskEndsAt,
  LoadingEditableTaskEndsAt,
} from './editable-task-ends-at'
import {
  EditableTaskEstimatedTime,
  LoadingEditableTaskEstimatedTime,
} from './editable-task-estimated-time'
import { EditableTaskName, LoadingEditableTaskName } from './editable-task-name'
import { EditableTaskNote, LoadingEditableTaskNote } from './editable-task-note'
import {
  EditableTaskStartsAt,
  LoadingEditableTaskStartsAt,
} from './editable-task-starts-at'
import {
  EditableTaskStatus,
  LoadingEditableTaskStatus,
} from './editable-task-status'
import {
  EditableTaskTimeSpent,
  LoadingEditableTaskTimeSpent,
} from './editable-task-time-spent'
import { LoadingTaskGroupLink, TaskGroupLink } from './task-group-link'

type Props = {
  id: string
}

export function TaskPage({ id }: Props) {
  return (
    <div className="flex flex-col space-y-10">
      <Suspense fallback={<LoadingEditableTaskName />}>
        <EditableTaskName id={id} />
      </Suspense>
      <Suspense fallback={<LoadingTaskGroupLink />}>
        <TaskGroupLink id={id} />
      </Suspense>
      <Suspense fallback={<LoadingEditableTaskStatus />}>
        <EditableTaskStatus id={id} />
      </Suspense>
      <Suspense fallback={<LoadingEditableTaskStartsAt />}>
        <EditableTaskStartsAt id={id} />
      </Suspense>
      <Suspense fallback={<LoadingEditableTaskEndsAt />}>
        <EditableTaskEndsAt id={id} />
      </Suspense>
      <Suspense fallback={<LoadingEditableTaskEstimatedTime />}>
        <EditableTaskEstimatedTime id={id} />
      </Suspense>
      <Suspense fallback={<LoadingEditableTaskTimeSpent />}>
        <EditableTaskTimeSpent id={id} />
      </Suspense>
      <Suspense fallback={<LoadingEditableTaskNote />}>
        <EditableTaskNote id={id} />
      </Suspense>
    </div>
  )
}
