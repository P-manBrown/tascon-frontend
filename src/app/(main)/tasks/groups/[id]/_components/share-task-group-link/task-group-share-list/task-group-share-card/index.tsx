import type { z } from "zod";
import { UserCard } from "@/components/cards/user-card";
import type { taskGroupShareStatusSchema } from "@/schemas/response/task-group-share";

type TaskGroupShareStatus = z.infer<typeof taskGroupShareStatusSchema>;

type Props = {
  share: {
    id: number;
    status: TaskGroupShareStatus;
    user: {
      id: number;
      name: string;
      bio?: string;
      avatarUrl?: string;
    };
  };
};

export function TaskGroupShareCard({ share }: Props) {
  const isHandoverPending = share.status === "handover_pending";

  return (
    <UserCard
      id={share.user.id}
      name={share.user.name}
      bio={share.user.bio}
      avatarUrl={share.user.avatarUrl}
    >
      <div
        className={`mt-4 font-bold ${
          isHandoverPending ? "text-orange-600" : "text-gray-500"
        }`}
      >
        {isHandoverPending ? "引き継ぎ依頼中" : "共有中"}
      </div>
    </UserCard>
  );
}
