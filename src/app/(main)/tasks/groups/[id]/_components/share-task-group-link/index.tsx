import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Avatar } from "@/components/avatars/avatar";
import { getTaskGroup } from "@/utils/api/get-task-group";

type Props = {
  taskGroupId: string;
};

const linkShapeClasses = "h-8 rounded-full";
const unsharedLinkSizeClasses = "w-[6.375rem]";

export default async function ShareTaskGroupLink({ taskGroupId }: Props) {
  const { taskGroup } = await getTaskGroup(taskGroupId);
  const { sharedUsers } = taskGroup;
  const visibleSharedUsers = sharedUsers.slice(0, 3);
  const href = `/tasks/groups/${taskGroupId}/share`;
  const isShared = sharedUsers.length > 0;
  const sharedUsersLabel =
    sharedUsers.length >= 2
      ? `計${sharedUsers.length}人`
      : sharedUsers[0]?.name;
  const avatarFadeClasses =
    visibleSharedUsers.length >= 2
      ? "[mask-image:linear-gradient(to_right,black_65%,transparent_100%)]"
      : "";

  return (
    <Link
      href={href}
      aria-label="タスクグループを共有"
      className={`flex items-center gap-x-1.5 overflow-hidden border border-gray-300 bg-theme py-1 pr-2 pl-1 duration-200 hover:brightness-90 ${linkShapeClasses} ${isShared ? "justify-start" : `justify-center ${unsharedLinkSizeClasses}`}`}
    >
      {isShared ? (
        <>
          <span
            className={`flex shrink-0 items-center overflow-hidden ${avatarFadeClasses}`}
          >
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
          <span className="min-w-0 truncate text-gray-700 text-sm">
            {sharedUsersLabel}
          </span>
        </>
      ) : (
        <>
          <ArrowUpTrayIcon className="size-4 shrink-0 text-gray-700" />
          <span className="min-w-0 truncate font-medium text-gray-700 text-sm">
            共有する
          </span>
        </>
      )}
    </Link>
  );
}

export function LoadingShareTaskGroupLink() {
  return (
    <div
      className={`skeleton ${linkShapeClasses} ${unsharedLinkSizeClasses}`}
    />
  );
}
