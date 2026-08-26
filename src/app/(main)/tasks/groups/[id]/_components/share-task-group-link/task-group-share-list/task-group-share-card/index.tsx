import { UserCard } from "@/components/cards/user-card";
import { RequestHandoverButton } from "./request-handover-button";

type Props = {
  disabled: React.ComponentProps<typeof RequestHandoverButton>["disabled"];
  taskGroupId: React.ComponentProps<
    typeof RequestHandoverButton
  >["taskGroupId"];
  share: {
    id: React.ComponentProps<typeof RequestHandoverButton>["shareId"];
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
      <div className={`mt-4 ${isHandoverPending ? "" : "relative z-10"}`}>
        {isHandoverPending ? (
          <p className="font-bold text-orange-600">引き継ぎ依頼中</p>
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
