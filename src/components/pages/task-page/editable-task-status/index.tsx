import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { getTask } from '@/utils/api/get-task'
import { TaskStatusEditor } from './task-status-editor'

type Props = {
  id: string
}

const layoutClasses = 'flex gap-10'

export async function EditableTaskStatus({ id }: Props) {
  const { task } = await getTask(id)

  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>ステータス</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <TaskStatusEditor
          taskId={task.id.toString()}
          initialStatus={task.status}
          layoutClasses={layoutClasses}
        />
      </DetailItemContentLayout>
    </div>
  )
}

export function LoadingEditableTaskStatus() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>ステータス</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <div className={layoutClasses}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="skeleton h-5 w-16 rounded-full" />
          ))}
        </div>
      </DetailItemContentLayout>
    </div>
  )
}
