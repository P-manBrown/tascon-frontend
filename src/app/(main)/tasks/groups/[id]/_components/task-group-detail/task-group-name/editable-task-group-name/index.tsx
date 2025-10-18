import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getTaskGroup } from '@/utils/api/get-task-group'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { TaskGroupNameEditor } from './task-group-name-editor'

type Props = {
  taskGroupId: string
}

export async function EditableTaskGroupName({ taskGroupId }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { taskGroup } = await getTaskGroup(taskGroupId)

  return (
    <TaskGroupNameEditor
      currentUserId={currentUser.id.toString()}
      taskGroupId={taskGroup.id.toString()}
      initialName={taskGroup.name}
      label={<DetailItemHeading>グループ名</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <DetailItemContentLayout>
        <DetailSingleLineText>{taskGroup.name}</DetailSingleLineText>
      </DetailItemContentLayout>
    </TaskGroupNameEditor>
  )
}

export function LoadingEditableTaskGroupName() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>グループ名</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
