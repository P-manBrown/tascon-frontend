import { LoadingUserCard } from "@/components/cards/user-card";
import { EmptyList } from "@/components/empty-list";
import { getOwnerTaskGroupShares } from "./get-task-group-shares.api";
import { TaskGroupShareCard } from "./task-group-share-card";

type Props = {
  taskGroupId: string;
};

export default async function TaskGroupShareList({ taskGroupId }: Props) {
  const { taskGroupShares } = await getOwnerTaskGroupShares(taskGroupId);

  if (taskGroupShares.length === 0) {
    return (
      <div className="my-8">
        <EmptyList description="共有中のユーザーはいません" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {taskGroupShares.map((share) => (
        <TaskGroupShareCard key={share.id} share={share} />
      ))}
    </div>
  );
}

export function LoadingTaskGroupShareList() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => index).map((index) => (
        <LoadingUserCard key={index} />
      ))}
    </div>
  );
}
