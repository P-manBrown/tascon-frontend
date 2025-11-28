import { getTasks } from '@/utils/api/get-tasks'
import { TaskCards } from './task-cards'
import { TaskCardsContainer } from './task-cards-container'

type Props = {
  page: string
  filter?: 'actionable'
  taskGroupId?: string
}

const containerShapeClasses = 'h-full w-full rounded-md md:w-96'

export async function TaskList({ page, filter, taskGroupId }: Props) {
  const { tasks, pagination } = await getTasks({
    page,
    limit: '10',
    filter,
    taskGroupId,
  })

  return (
    <TaskCardsContainer
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      pageItems={pagination.pageItems.toString()}
      className={containerShapeClasses}
    >
      <div className="m-2 md:m-3">
        <TaskCards tasks={tasks} />
      </div>
    </TaskCardsContainer>
  )
}

export function LoadingTaskList() {
  return <div className={`skeleton ${containerShapeClasses}`} />
}
