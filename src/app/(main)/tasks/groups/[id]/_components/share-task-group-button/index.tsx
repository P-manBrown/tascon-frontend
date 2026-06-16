import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Avatar } from "@/components/avatars/avatar";
import { getTaskGroup } from "@/utils/api/get-task-group";

type Props = {
  taskGroupId: string;
};

export default async function ShareTaskGroupButton({ taskGroupId }: Props) {
  const { taskGroup } = await getTaskGroup(taskGroupId);
  const { sharedUsers } = taskGroup;
  const visibleSharedUsers = sharedUsers.slice(0, 3);
  const href = `/tasks/groups/${taskGroupId}/share`;
  const ariaLabel = "タスクグループを共有";

  return sharedUsers.length === 0 ? (
    <Link href={href} aria-label={ariaLabel} className="btn-icon">
      <ArrowUpTrayIcon className="size-5" />
    </Link>
  ) : (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="flex h-8 items-center gap-x-2 rounded-full border border-gray-300 bg-theme py-1 pr-3 pl-1 duration-200 hover:brightness-90"
    >
      <span className="flex items-center">
        {visibleSharedUsers.map((user, index) => (
          <span key={user.id} className={index === 0 ? undefined : "-ml-2"}>
            <Avatar
              size={24}
              name={user.name}
              avatarUrl={user.avatarUrl ?? undefined}
            />
          </span>
        ))}
      </span>
      {sharedUsers.length > 3 ? (
        <span className="text-gray-700 text-sm">+{sharedUsers.length - 3}</span>
      ) : (
        <span className="max-w-20 truncate text-gray-700 text-sm">
          {sharedUsers[0].name}
        </span>
      )}
    </Link>
  );
}

export function LoadingShareTaskGroupButton() {
  return <div className="skeleton size-8 rounded-full" />;
}
