import Link from 'next/link'
import { Avatar } from '@/components/avatars/avatar'
import { getTaskGroupShare } from '../get-task-group-share.api'

type Props = {
  id: string
}

const avatarSize = 24
const linkShapeCalsses = 'h-8 w-28 rounded-full'

export async function SharedTaskGroupOwner({ id }: Props) {
  const { taskGroupShare } = await getTaskGroupShare(id)
  const { owner } = taskGroupShare.taskGroup

  return (
    <Link
      href={`/users/profile/${owner.id}`}
      className={`bg-theme flex items-center gap-x-2 border border-gray-300 py-1 pr-3 pl-1 duration-200 hover:brightness-90 ${linkShapeCalsses}`}
      aria-label={`${owner.name}の詳細画面を表示`}
    >
      <Avatar size={avatarSize} name={owner.name} avatarUrl={owner.avatarUrl} />
      <span className="truncate text-sm text-gray-700">{owner.name}</span>
    </Link>
  )
}

export function LoadingSharedTaskGroupOwner() {
  return <div className={`skeleton ${linkShapeCalsses}`} />
}
