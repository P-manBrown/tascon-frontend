import { UserCard } from "@/components/cards/user-card";
import { CancelHandoverRequestButton } from "./cancel-handover-request-button";
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

export function TaskGroupShareCard({ share, taskGroupId, disabled }: Props) {
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
          <CancelHandoverRequestButton
            shareId={share.id}
            taskGroupId={taskGroupId}
          />
        ) : (
          <RequestHandoverButton
            shareId={share.id}
            taskGroupId={taskGroupId}
            userName={share.user.name}
            disabled={disabled}
          />
        )}
      </div>
    </UserCard>
  );
}
