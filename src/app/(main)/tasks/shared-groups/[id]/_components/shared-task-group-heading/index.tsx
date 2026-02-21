import { TaskGroupNameHeading } from '@/components/headings/task-group-name-heading'
import { getTaskGroupShare } from '../get-task-group-share.api'

type Props = {
  id: string
}

export async function SharedTaskGroupHeading({ id }: Props) {
  const { taskGroupShare } = await getTaskGroupShare(id)

  return (
    <TaskGroupNameHeading>{taskGroupShare.taskGroup.name}</TaskGroupNameHeading>
  )
}
