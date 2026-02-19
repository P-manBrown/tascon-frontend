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
import { TaskEstimatedTimeEditor } from './task-estimated-time-editor'

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

export async function EditableTaskEstimatedTime({ id }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { task } = await getTask(id)

  return (
    <TaskEstimatedTimeEditor
      currentUserId={currentUser.id.toString()}
      taskId={task.id.toString()}
      initialEstimatedMinutes={task.estimatedMinutes}
      label={<DetailItemHeading>見積もり</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <DetailItemContentLayout>
        {task.estimatedMinutes === undefined ? (
          <p className="text-gray-500">見積もりを設定できます...</p>
        ) : (
          <DetailSingleLineText>
            {formatMinutes(task.estimatedMinutes)}
          </DetailSingleLineText>
        )}
      </DetailItemContentLayout>
    </TaskEstimatedTimeEditor>
  )
}

export function LoadingEditableTaskEstimatedTime() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>見積もり</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
