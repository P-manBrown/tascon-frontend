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
import { TaskStartsAtEditor } from './task-starts-at-editor'

type Props = {
  id: string
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

export async function EditableTaskStartsAt({ id }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { task } = await getTask(id)

  return (
    <TaskStartsAtEditor
      currentUserId={currentUser.id.toString()}
      taskId={task.id.toString()}
      initialStartsAt={task.startsAt}
      endsAt={task.endsAt}
      label={<DetailItemHeading>開始日</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <DetailItemContentLayout>
        {task.startsAt === undefined ? (
          <p className="text-gray-500">開始日を設定できます...</p>
        ) : (
          <DetailSingleLineText>
            {formatDateTime(task.startsAt)}
          </DetailSingleLineText>
        )}
      </DetailItemContentLayout>
    </TaskStartsAtEditor>
  )
}

export function LoadingEditableTaskStartsAt() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>開始日</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
