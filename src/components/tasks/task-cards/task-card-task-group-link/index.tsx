'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const iconSize = 20

const Emoji = dynamic(
  () => import('emoji-picker-react').then((mod) => mod.Emoji),
  {
    loading: () => (
      <span
        className="skeleton block rounded-sm"
        style={{ height: `${iconSize}px`, width: `${iconSize}px` }}
      />
    ),
    ssr: false,
  },
)

type Props = {
  id: number
  name: string
  icon: string
}

export function TaskCardTaskGroupLink({ id, name, icon }: Props) {
  return (
    <Link
      className="flex w-fit items-center gap-2 rounded-sm p-1 duration-200 hover:bg-gray-600/10"
      href={`/tasks/groups/${id}`}
    >
      <Emoji unified={icon} size={iconSize} />
      <span className="text-gray-600">{name}</span>
    </Link>
  )
}
