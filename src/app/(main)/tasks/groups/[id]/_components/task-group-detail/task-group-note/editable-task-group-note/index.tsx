import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import { getTaskGroup } from '@/utils/api/get-task-group'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { TaskGroupNoteCollapsibleSection } from './task-group-note-collapsible-section'
import { TaskGroupNoteEditor } from './task-group-note-editor'

type Props = {
  taskGroupId: string
}

const minHeight = 160

export async function EditableTaskGroupNote({ taskGroupId }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { taskGroup } = await getTaskGroup(taskGroupId)

  return (
    <TaskGroupNoteEditor
      currentUserId={currentUser.id.toString()}
      taskGroupId={taskGroupId}
      initialNote={taskGroup.note}
      label={<DetailItemHeading>メモ</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <TaskGroupNoteCollapsibleSection minHeight={minHeight}>
        <DetailItemContentLayout>
          {taskGroup.note === undefined || taskGroup.note === '' ? (
            <p className="text-gray-500">メモを登録できます...</p>
          ) : (
            <DetailMultiLineText>{taskGroup.note}</DetailMultiLineText>
          )}
        </DetailItemContentLayout>
      </TaskGroupNoteCollapsibleSection>
    </TaskGroupNoteEditor>
  )
}

export function LoadingEditableTaskGroupNote() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>メモ</DetailItemHeading>
      </DetailItemHeadingLayout>
      <div style={{ height: `${minHeight}px` }}>
        <DetailItemContentLayout>
          <LoadingDetailMultiLineText lines={6} />
        </DetailItemContentLayout>
      </div>
    </div>
  )
}
