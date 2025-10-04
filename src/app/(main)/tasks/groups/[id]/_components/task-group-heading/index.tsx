import { getTaskGroup } from '@/utils/api/get-task-group'

type Props = {
  id: string
}

export async function TaskGroupHeading({ id }: Props) {
  const { taskGroup } = await getTaskGroup(id)

  return <h1 className="truncate text-2xl font-bold">{taskGroup.name}</h1>
}

export function LoadingTaskGroupHeading() {
  return <span className="skeleton my-1 block h-6 w-60 rounded-md" />
}
