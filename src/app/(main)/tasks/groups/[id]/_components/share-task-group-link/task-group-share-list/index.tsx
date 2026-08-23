import { LoadingUserCard } from "@/components/cards/user-card";
import { EmptyList } from "@/components/empty-list";
import { TaskGroupShareCardsCollapsibleSection } from "../task-group-share-cards-collapsible-section";
import { getOwnerTaskGroupShares } from "./get-task-group-shares.api";
import { TaskGroupShareCard } from "./task-group-share-card";

type Props = {
  taskGroupId: string;
};

const shareCardsMinHeight = 372;

export default async function TaskGroupShareList({ taskGroupId }: Props) {
  const { taskGroupShares } = await getOwnerTaskGroupShares(taskGroupId);

  if (taskGroupShares.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-4"
        style={{ height: `${shareCardsMinHeight}px` }}
      >
        <EmptyList description="共有中のユーザーはいません" />
      </div>
    );
  }

  return (
    <TaskGroupShareCardsCollapsibleSection>
      <div className="p-4">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {taskGroupShares.map((share) => (
            <TaskGroupShareCard key={share.id} share={share} />
          ))}
        </div>
      </div>
    </TaskGroupShareCardsCollapsibleSection>
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
