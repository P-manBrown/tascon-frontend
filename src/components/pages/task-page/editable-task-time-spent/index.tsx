import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getTask } from '@/utils/api/get-task'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { TaskTimeSpentEditor } from './task-time-spent-editor'

type Props = {
  id: string
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}分`
  } else if (mins === 0) {
    return `${hours}時間`
  } else {
    return `${hours}時間${mins}分`
  }
}

export async function EditableTaskTimeSpent({ id }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { task } = await getTask(id)

  return (
    <TaskTimeSpentEditor
      currentUserId={currentUser.id.toString()}
      taskId={task.id.toString()}
      initialTimeSpent={task.timeSpent}
      label={<DetailItemHeading>作業時間</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <DetailItemContentLayout>
        {task.timeSpent === undefined ? (
          <p className="text-gray-500">作業時間を設定できます...</p>
        ) : (
          <DetailSingleLineText>
            {formatMinutes(task.timeSpent)}
          </DetailSingleLineText>
        )}
      </DetailItemContentLayout>
    </TaskTimeSpentEditor>
  )
}

export function LoadingEditableTaskTimeSpent() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>作業時間</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
