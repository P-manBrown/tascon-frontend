import { TaskCards } from '@/components/task-list/task-cards'
import { TaskCardsContainer } from '@/components/task-list/task-cards-container'
import { getSharedTaskGroupTasks } from '../get-shared-task-group-tasks.api'

type Props = {
  id: string
  page: string
}

const containerShapeClasses = 'h-full w-full rounded-md md:w-96'

export async function SharedTaskGroupTaskList({ id, page }: Props) {
  const { tasks, pagination } = await getSharedTaskGroupTasks({
    id: id,
    page,
    limit: '10',
  })

  return (
    <TaskCardsContainer
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      pageItems={pagination.pageItems.toString()}
      className={containerShapeClasses}
      isReadonly={true}
    >
      <div className="m-2 md:m-3">
        <TaskCards tasks={tasks} isReadonly={true} />
      </div>
    </TaskCardsContainer>
  )
}

export function LoadingSharedTaskGroupTaskList() {
  return <div className={`skeleton ${containerShapeClasses}`} />
}
