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
import { TaskEndsAtEditor } from './task-ends-at-editor'

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

export async function EditableTaskEndsAt({ id }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { task } = await getTask(id)

  return (
    <TaskEndsAtEditor
      currentUserId={currentUser.id.toString()}
      taskId={task.id.toString()}
      initialEndsAt={task.endsAt}
      startsAt={task.startsAt}
      label={<DetailItemHeading>期日</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <DetailItemContentLayout>
        {task.endsAt === undefined ? (
          <p className="text-gray-500">期日を設定できます...</p>
        ) : (
          <DetailSingleLineText>
            {formatDateTime(task.endsAt)}
          </DetailSingleLineText>
        )}
      </DetailItemContentLayout>
    </TaskEndsAtEditor>
  )
}

export function LoadingEditableTaskEndsAt() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>期日</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
