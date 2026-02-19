import Link from 'next/link'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { LoadingDetailSingleLineText } from '@/components/texts/detail-single-line-text'
import { getTask } from '@/utils/api/get-task'

type Props = {
  id: string
}

export async function TaskGroupLink({ id }: Props) {
  const { task } = await getTask(id)

  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>タスクグループ</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <Link
          href={`/tasks/groups/${task.taskGroup.id}`}
          className="link block truncate"
        >
          {task.taskGroup.name}
        </Link>
      </DetailItemContentLayout>
    </div>
  )
}

export function LoadingTaskGroupLink() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>タスクグループ</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
