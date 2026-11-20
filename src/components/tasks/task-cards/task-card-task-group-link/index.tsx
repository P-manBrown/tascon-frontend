import Link from "next/link";
import { Emoji } from "@/components/emojis/emoji";

const iconSize = 20;

type Props = {
  id: number;
  name: string;
  icon: string;
};

export function TaskCardTaskGroupLink({ id, name, icon }: Props) {
  return (
    <Link
      className="flex w-fit items-center gap-2 rounded-sm p-1 duration-200 hover:bg-gray-600/10"
      href={`/tasks/groups/${id}`}
    >
      <Emoji unified={icon} size={iconSize} />
      <span className="text-gray-600">{name}</span>
    </Link>
  );
}
