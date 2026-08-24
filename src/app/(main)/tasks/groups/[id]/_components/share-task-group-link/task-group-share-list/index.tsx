import { LoadingUserCard } from "@/components/cards/user-card";
import { EmptyList } from "@/components/empty-list";
import { CollapsibleTaskGroupShareCards } from "./collapsible-task-group-share-cards";
import { getOwnerTaskGroupShares } from "./get-task-group-shares.api";

type Props = {
  taskGroupId: string;
};

const shareCardsMinHeight = 372;

export default async function TaskGroupShareList({ taskGroupId }: Props) {
  const { taskGroupShares } = await getOwnerTaskGroupShares(taskGroupId);

  return taskGroupShares.length === 0 ? (
    <div
      className="flex items-center justify-center p-4"
      style={{ height: `${shareCardsMinHeight}px` }}
    >
      <EmptyList description="共有中のユーザーはいません" />
    </div>
  ) : (
    <CollapsibleTaskGroupShareCards
      taskGroupShares={taskGroupShares}
      taskGroupId={taskGroupId}
    />
  );
}

export function LoadingTaskGroupShareList() {
  return (
    <div
      className="overflow-clip"
      style={{ height: `${shareCardsMinHeight}px` }}
    >
      <div className="grid gap-4 p-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => index).map((index) => (
          <LoadingUserCard key={index}>
            <div className="skeleton mt-4 h-6 w-20 rounded" />
          </LoadingUserCard>
        ))}
      </div>
    </div>
  );
}
