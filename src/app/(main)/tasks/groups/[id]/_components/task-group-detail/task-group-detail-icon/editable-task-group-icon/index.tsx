import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { getTaskGroup } from '@/utils/api/get-task-group'
import { TaskGroupDetailEmoji } from '../task-group-detail-emoji'
import { TaskGroupIconEditor } from './task-group-icon-editor'

type Props = {
  taskGroupId: string
}

export async function EditableTaskGroupIcon({ taskGroupId }: Props) {
  const { taskGroup } = await getTaskGroup(taskGroupId)

  return (
    <TaskGroupIconEditor
      taskGroupId={taskGroupId}
      label={<DetailItemHeading>アイコン</DetailItemHeading>}
    >
      <TaskGroupDetailEmoji unified={taskGroup.icon} />
    </TaskGroupIconEditor>
  )
}

export function LoadingEditableTaskGroupIcon() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>アイコン</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <div className="skeleton size-8 rounded-sm" />
      </DetailItemContentLayout>
    </div>
  )
}
