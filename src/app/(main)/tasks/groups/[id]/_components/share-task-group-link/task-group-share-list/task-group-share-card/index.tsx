import { UserCard } from "@/components/cards/user-card";
import { RequestHandoverButton } from "./request-handover-button";

type Props = {
  taskGroupId: React.ComponentProps<
    typeof RequestHandoverButton
  >["taskGroupId"];
  share: {
    id: React.ComponentProps<typeof RequestHandoverButton>["shareId"];
    status: "shared" | "handover_pending";
    user: Omit<React.ComponentProps<typeof UserCard>, "children">;
  };
};

export function TaskGroupShareCard({ share, taskGroupId }: Props) {
  const isHandoverPending = share.status === "handover_pending";

  return (
    <UserCard
      id={share.user.id}
      name={share.user.name}
      bio={share.user.bio}
      avatarUrl={share.user.avatarUrl}
    >
      <p
        className={`mt-4 font-bold ${
          isHandoverPending ? "text-orange-600" : "text-gray-500"
        }`}
      >
        {isHandoverPending ? "引き継ぎ依頼中" : "共有中"}
      </p>
      {!isHandoverPending && (
        <div className="relative z-10 mt-4">
          <RequestHandoverButton
            shareId={share.id}
            taskGroupId={taskGroupId}
            userName={share.user.name}
          />
        </div>
      )}
    </UserCard>
  );
}
