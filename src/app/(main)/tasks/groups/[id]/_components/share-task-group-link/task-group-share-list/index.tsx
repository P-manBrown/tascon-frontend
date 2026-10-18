import { EmptyList } from "@/components/empty-list";
import { CollapsibleTaskGroupShareCards } from "./collapsible-task-group-share-cards";
import { getOwnerTaskGroupShares } from "./get-task-group-shares.api";
import { LoadingTaskGroupShareCards } from "./task-group-share-cards";

type Props = {
  taskGroupId: string;
};

const shareCardsMinHeight = 412;

export default async function TaskGroupShareList({ taskGroupId }: Props) {
  const { taskGroupShares } = await getOwnerTaskGroupShares(taskGroupId);
  const disabled = taskGroupShares.some(
    (share) => share.status === "handover_pending",
  );

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
      minHeight={shareCardsMinHeight}
      disabled={disabled}
    />
  );
}

export function LoadingTaskGroupShareList() {
  return (
    <div
      className="overflow-clip"
      style={{ height: `${shareCardsMinHeight}px` }}
    >
      <div className="p-4">
        <LoadingTaskGroupShareCards limit={6} />
      </div>
    </div>
  );
}
