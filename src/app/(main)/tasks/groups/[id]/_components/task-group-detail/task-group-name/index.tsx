import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getTaskGroup } from '@/utils/api/get-task-group'

type Props = {
  id: string
}

export async function TaskGroupName({ id }: Props) {
  const { taskGroup } = await getTaskGroup(id)

  return <DetailSingleLineText>{taskGroup.name}</DetailSingleLineText>
}

export function LoadingTaskGroupName() {
  return <LoadingDetailSingleLineText />
}
