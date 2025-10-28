import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import { getTaskGroup } from '@/utils/api/get-task-group'

type Props = {
  id: string
}

export async function TaskGroupNote({ id }: Props) {
  const { taskGroup } = await getTaskGroup(id)

  return (
    <div>
      {taskGroup.note === undefined || taskGroup.note === '' ? (
        <p className="text-gray-500">メモを登録できます...</p>
      ) : (
        <DetailMultiLineText>{taskGroup.note}</DetailMultiLineText>
      )}
    </div>
  )
}

export function LoadingTaskGroupNote() {
  return <LoadingDetailMultiLineText lines={6} />
}
