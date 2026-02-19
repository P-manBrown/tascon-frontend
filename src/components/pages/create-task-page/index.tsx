import { getTaskGroups } from '@/utils/api/get-task-groups'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { CreateTaskForm } from './create-task-form'

type Props = Pick<
  React.ComponentProps<typeof CreateTaskForm>,
  'defaultTaskGroupId'
>

export async function CreateTaskPage({ defaultTaskGroupId }: Props) {
  const { account: currentUser } = await getCurrentUser()
  const { taskGroups } = await getTaskGroups()

  return (
    <div>
      <h1 className="text-center text-2xl font-bold">タスク作成</h1>
      <div className="mt-6">
        <CreateTaskForm
          currentUserId={currentUser.id.toString()}
          taskGroups={taskGroups}
          defaultTaskGroupId={defaultTaskGroupId}
        />
      </div>
    </div>
  )
}
