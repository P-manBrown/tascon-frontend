import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { getSharedTask } from '@/components/pages/shared-task-page/get-shared-task.api'
import { TaskNoteCollapsibleSection } from '@/components/pages/task-page/editable-task-note/task-note-collapsible-section'
import { TaskStatusSquare } from '@/components/tasks/task-cards/task-card/task-status-square'
import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { formatDateTime } from '@/utils/task/format-date-time'
import { formatMinutes } from '@/utils/task/format-minutes'
import { TASK_STATUS_LABELS } from '@/utils/task/task-status-labels'

type Props = {
  shareId: string
  taskId: string
}

const noteMinHeight = 160

export async function SharedTaskPage({ shareId, taskId }: Props) {
  const { task } = await getSharedTask({ shareId: shareId, taskId })

  return (
    <div className="flex flex-col space-y-10">
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>タスク名</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <DetailSingleLineText>{task.name}</DetailSingleLineText>
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>タスクグループ</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <DetailSingleLineText>{task.taskGroup.name}</DetailSingleLineText>
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>ステータス</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <div className="flex items-center gap-2">
            <TaskStatusSquare status={task.status} />
            <span className="text-sm">{TASK_STATUS_LABELS[task.status]}</span>
          </div>
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>開始日</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          {task.startsAt === undefined ? (
            <p className="text-gray-500">開始日は設定されていません...</p>
          ) : (
            <DetailSingleLineText>
              {formatDateTime(task.startsAt)}
            </DetailSingleLineText>
          )}
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>期日</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          {task.endsAt === undefined ? (
            <p className="text-gray-500">期日は設定されていません...</p>
          ) : (
            <DetailSingleLineText>
              {formatDateTime(task.endsAt)}
            </DetailSingleLineText>
          )}
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>見積もり</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          {task.estimatedMinutes === undefined ? (
            <p className="text-gray-500">見積もりは設定されていません...</p>
          ) : (
            <DetailSingleLineText>
              {formatMinutes(task.estimatedMinutes)}
            </DetailSingleLineText>
          )}
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>作業時間</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          {task.timeSpent === undefined ? (
            <p className="text-gray-500">作業時間は設定されていません...</p>
          ) : (
            <DetailSingleLineText>
              {formatMinutes(task.timeSpent)}
            </DetailSingleLineText>
          )}
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>メモ</DetailItemHeading>
        </DetailItemHeadingLayout>
        <TaskNoteCollapsibleSection minHeight={noteMinHeight}>
          <DetailItemContentLayout>
            {task.note === undefined || task.note === '' ? (
              <p className="text-gray-500">メモは設定されていません...</p>
            ) : (
              <DetailMultiLineText>{task.note}</DetailMultiLineText>
            )}
          </DetailItemContentLayout>
        </TaskNoteCollapsibleSection>
      </div>
    </div>
  )
}

export function LoadingSharedTaskPage() {
  return (
    <div className="flex flex-col space-y-10">
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>タスク名</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingDetailSingleLineText />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>タスクグループ</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingDetailSingleLineText />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>ステータス</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <div className="skeleton h-5 w-16 rounded-full" />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>開始日</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingDetailSingleLineText />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>期日</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingDetailSingleLineText />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>見積もり</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingDetailSingleLineText />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>作業時間</DetailItemHeading>
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
  )
}
