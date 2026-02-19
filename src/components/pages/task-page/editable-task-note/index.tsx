import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import { getTask } from '@/utils/api/get-task'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { TaskNoteCollapsibleSection } from './task-note-collapsible-section'
import { TaskNoteEditor } from './task-note-editor'

type Props = {
  id: string
}

const minHeight = 160

export async function EditableTaskNote({ id }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { task } = await getTask(id)

  return (
    <TaskNoteEditor
      currentUserId={currentUser.id.toString()}
      taskId={task.id.toString()}
      initialNote={task.note}
      label={<DetailItemHeading>メモ</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <TaskNoteCollapsibleSection minHeight={minHeight}>
        <DetailItemContentLayout>
          {task.note === undefined || task.note === '' ? (
            <p className="text-gray-500">メモを設定できます...</p>
          ) : (
            <DetailMultiLineText>{task.note}</DetailMultiLineText>
          )}
        </DetailItemContentLayout>
      </TaskNoteCollapsibleSection>
    </TaskNoteEditor>
  )
}

export function LoadingEditableTaskNote() {
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
