import { TaskGroupDetailEmoji } from '@/app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-detail-icon/task-group-detail-emoji'
import { TaskGroupNoteCollapsibleSection } from '@/app/(main)/tasks/groups/[id]/_components/task-group-detail/task-group-note/editable-task-group-note/task-group-note-collapsible-section'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getTaskGroupShare } from '../get-task-group-share.api'

type Props = {
  id: string
}

const noteMinHeight = 160

export async function SharedTaskGroupDetail({ id }: Props) {
  const { taskGroupShare } = await getTaskGroupShare(id)
  const { taskGroup } = taskGroupShare

  return (
    <div className="md:w-160">
      <div className="flex flex-col gap-y-10">
        <div>
          <DetailItemHeadingLayout>
            <DetailItemHeading>アイコン</DetailItemHeading>
          </DetailItemHeadingLayout>
          <DetailItemContentLayout>
            <TaskGroupDetailEmoji unified={taskGroup.icon} />
          </DetailItemContentLayout>
        </div>
        <div>
          <DetailItemHeadingLayout>
            <DetailItemHeading>グループ名</DetailItemHeading>
          </DetailItemHeadingLayout>
          <DetailItemContentLayout>
            <DetailSingleLineText>{taskGroup.name}</DetailSingleLineText>
          </DetailItemContentLayout>
        </div>
        <div>
          <DetailItemHeadingLayout>
            <DetailItemHeading>メモ</DetailItemHeading>
          </DetailItemHeadingLayout>
          <TaskGroupNoteCollapsibleSection minHeight={noteMinHeight}>
            <DetailItemContentLayout>
              {taskGroup.note === undefined || taskGroup.note === '' ? (
                <p className="text-gray-500">メモは登録されていません...</p>
              ) : (
                <DetailMultiLineText>{taskGroup.note}</DetailMultiLineText>
              )}
            </DetailItemContentLayout>
          </TaskGroupNoteCollapsibleSection>
        </div>
      </div>
    </div>
  )
}

export function LoadingSharedTaskGroupDetail() {
  return (
    <div className="md:w-160">
      <div className="flex flex-col gap-y-10">
        <div>
          <DetailItemHeadingLayout>
            <DetailItemHeading>アイコン</DetailItemHeading>
          </DetailItemHeadingLayout>
          <DetailItemContentLayout>
            <div className="skeleton size-8 rounded-sm" />
          </DetailItemContentLayout>
        </div>
        <div>
          <DetailItemHeadingLayout>
            <DetailItemHeading>グループ名</DetailItemHeading>
          </DetailItemHeadingLayout>
          <DetailItemContentLayout>
            <LoadingDetailSingleLineText />
          </DetailItemContentLayout>
        </div>
        <div>
          <DetailItemHeadingLayout>
            <DetailItemHeading>メモ</DetailItemHeading>
          </DetailItemHeadingLayout>
          <div style={{ height: `${noteMinHeight}px` }}>
            <DetailItemContentLayout>
              <LoadingDetailMultiLineText lines={6} />
            </DetailItemContentLayout>
          </div>
        </div>
      </div>
    </div>
  )
}
