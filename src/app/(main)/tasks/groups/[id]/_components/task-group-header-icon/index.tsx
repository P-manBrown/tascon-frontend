import { getTaskGroup } from '@/utils/api/get-task-group'
import { TaskGroupHeaderEmoji } from './task-group-header-emoji'

type Props = {
  id: string
}

export async function TaskGroupHeaderIcon({ id }: Props) {
  const { taskGroup } = await getTaskGroup(id)

  return <TaskGroupHeaderEmoji unified={taskGroup.icon} />
}

export function LoadingTaskGroupHeaderIcon() {
  return <span className="skeleton block size-7 rounded-sm" />
}
