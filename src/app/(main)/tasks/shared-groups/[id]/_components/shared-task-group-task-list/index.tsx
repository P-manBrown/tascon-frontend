import { SharedTaskCards } from "@/app/(main)/tasks/shared-groups/[id]/_components/shared-task-group-task-list/shared-task-cards";
import { TaskCardsContainer } from "@/components/tasks/task-cards-container";
import { getSharedTasks } from "../get-shared-tasks.api";
import { SharedTaskCalendar } from "../shared-task-calendar";

type Props = {
  shareId: string;
  page: string;
};

const containerShapeClasses = "h-full w-full rounded-md md:w-96";

export async function SharedTaskGroupTaskList({ shareId, page }: Props) {
  const { tasks, pagination } = await getSharedTasks({
    shareId,
    page,
    limit: "10",
  });

  return (
    <TaskCardsContainer
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      pageItems={pagination.pageItems.toString()}
      className={containerShapeClasses}
      isReadonly={true}
      calendar={<SharedTaskCalendar shareId={shareId} />}
    >
      <div className="m- md:m-3">
        <SharedTaskCards shareId={shareId} tasks={tasks} />
      </div>
    </TaskCardsContainer>
  );
}

export function LoadingSharedTaskGroupTaskList() {
  return <div className={`skeleton ${containerShapeClasses}`} />;
}
