import { TaskGroupHeaderEmoji } from '@/app/(main)/tasks/groups/[id]/_components/task-group-header-icon/task-group-header-emoji'
import { getTaskGroupShare } from '../get-task-group-share.api'

type Props = {
  id: string
}

export async function SharedTaskGroupHeaderIcon({ id }: Props) {
  const { taskGroupShare } = await getTaskGroupShare(id)

  return <TaskGroupHeaderEmoji unified={taskGroupShare.taskGroup.icon} />
}

export function LoadingSharedTaskGroupHeaderIcon() {
  return <span className="skeleton block size-7 rounded-sm" />
}
