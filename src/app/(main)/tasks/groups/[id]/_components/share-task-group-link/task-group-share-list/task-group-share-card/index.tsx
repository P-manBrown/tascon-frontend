import { UserCard } from "@/components/cards/user-card";
import { getTaskGroup } from "@/utils/api/get-task-group";
import { CancelHandoverRequestButton } from "./cancel-handover-request-button";
import { CancelTaskGroupShareButton } from "./cancel-task-group-share-button";
import { RequestHandoverButton } from "./request-handover-button";

type Props = {
  disabled: React.ComponentProps<typeof RequestHandoverButton>["disabled"];
  taskGroupId: string;
  share: {
    id: number;
    status: "shared" | "handover_pending";
    user: Omit<React.ComponentProps<typeof UserCard>, "children">;
  };
};

export async function TaskGroupShareCard({
  share,
  taskGroupId,
  disabled,
}: Props) {
  const { taskGroup } = await getTaskGroup(taskGroupId);
  const isHandoverPending = share.status === "handover_pending";

  return (
    <UserCard
      id={share.user.id}
      name={share.user.name}
      bio={share.user.bio}
      avatarUrl={share.user.avatarUrl}
    >
      <div className="relative z-10 mt-4">
        {isHandoverPending ? (
          <div>
            <CancelHandoverRequestButton
              shareId={share.id}
              taskGroupId={taskGroupId}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <RequestHandoverButton
              shareId={share.id}
              taskGroupId={taskGroupId}
              userName={share.user.name}
              disabled={disabled}
            />
            <CancelTaskGroupShareButton
              shareId={share.id}
              taskGroupId={taskGroupId}
              taskGroupName={taskGroup.name}
              userName={share.user.name}
            />
          </div>
        )}
      </div>
    </UserCard>
  );
}
