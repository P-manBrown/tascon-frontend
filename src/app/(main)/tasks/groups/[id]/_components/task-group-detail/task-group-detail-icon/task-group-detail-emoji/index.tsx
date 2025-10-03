'use client'

import dynamic from 'next/dynamic'

const iconSize = 24

const Emoji = dynamic(
  () => import('emoji-picker-react').then((mod) => mod.Emoji),
  {
    loading: () => (
      <span
        className={`skeleton block rounded-sm`}
        style={{ height: `${iconSize}px`, width: `${iconSize}px` }}
      />
    ),
    ssr: false,
  },
)

type Props = {
  unified: string
}

export function TaskGroupDetailEmoji({ unified }: Props) {
  return <Emoji unified={unified} size={iconSize} />
}
