import { TaskGroupNameHeading } from '@/components/headings/task-group-name-heading'
import { getTaskGroup } from '@/utils/api/get-task-group'

type Props = {
  id: string
}

export async function TaskGroupHeading({ id }: Props) {
  const { taskGroup } = await getTaskGroup(id)

  return <TaskGroupNameHeading>{taskGroup.name}</TaskGroupNameHeading>
}
