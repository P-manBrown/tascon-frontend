import { getTaskGroup } from '@/utils/api/get-task-group'
import { TaskGroupDetailEmoji } from './task-group-detail-emoji'

type Props = {
  id: string
}

export async function TaskGroupDetailIcon({ id }: Props) {
  const { taskGroup } = await getTaskGroup(id)

  return <TaskGroupDetailEmoji unified={taskGroup.icon} />
}

export function LoadingTaskGroupDetailIcon() {
  return <span className="skeleton block size-6 rounded-sm" />
}
