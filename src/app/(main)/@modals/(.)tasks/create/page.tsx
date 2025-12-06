import { CreateTaskPage } from '@/components/pages/create-task-page'

type Props = {
  searchParams: Promise<{
    task_group_id?: string
  }>
}

export default async function CreateTask({ searchParams }: Props) {
  const params = await searchParams
  const { task_group_id } = params

  const defaultTaskGroupId = task_group_id ? Number(task_group_id) : undefined

  return <CreateTaskPage defaultTaskGroupId={defaultTaskGroupId} />
}
