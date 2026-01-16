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
import { TaskNameEditor } from './task-name-editor'

type Props = {
  id: string
}

export async function EditableTaskName({ id }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { task } = await getTask(id)

  return (
    <TaskNameEditor
      currentUserId={currentUser.id.toString()}
      taskId={task.id.toString()}
      initialName={task.name}
      label={<DetailItemHeading>タスク名</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <DetailItemContentLayout>
        <DetailSingleLineText>{task.name}</DetailSingleLineText>
      </DetailItemContentLayout>
    </TaskNameEditor>
  )
}

export function LoadingEditableTaskName() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>タスク名</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
