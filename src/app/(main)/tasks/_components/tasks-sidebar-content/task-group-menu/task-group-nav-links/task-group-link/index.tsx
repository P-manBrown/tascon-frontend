import Link from "next/link";
import { Emoji } from "@/components/emojis/emoji";

const iconSize = 20;

type Props = {
  id: number;
  name: string;
  icon: string;
  currentPath: string;
  sidebarQuery?: Record<string, string>;
  className: string;
};

export function TaskGroupLink({
  id,
  name,
  icon,
  currentPath,
  sidebarQuery,
  className,
}: Props) {
  const groupPath = `/tasks/groups/${id}`;
  const isActive = groupPath === currentPath;

  return (
    <Link
      href={{ pathname: groupPath, query: sidebarQuery }}
      className={`flex items-center gap-x-2 rounded-sm ${
        isActive
          ? 'pointer-events-none relative bg-gray-600/10 text-black before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:rounded-sm before:bg-gray-600 before:content-[""]'
          : "duration-200 hover:bg-gray-600/10 hover:text-black"
      } ${className}`}
      prefetch={isActive ? false : null}
      tabIndex={isActive ? -1 : undefined}
    >
      <span className="flex-none">
        <Emoji unified={icon} size={iconSize} />
      </span>
      <span className="truncate">{name}</span>
    </Link>
  );
}
