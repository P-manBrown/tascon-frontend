import Link from 'next/link'
import { Avatar, LoadingAvatar } from '@/components/avatars/avatar/index'

type Props = {
  id: number
  name: string
  bio: string | undefined
  avatarUrl: string | undefined
  children?: React.ReactNode
}

const avatarSize = 64

const cardBaseClasses =
  'rounded-md border border-gray-300 bg-white p-6 drop-shadow-sm'
const flexContainerClasses = 'flex items-center gap-4'
const contentContainerBaseClasses = 'flex flex-col gap-1'

export function UserCard({ id, name, bio, avatarUrl, children }: Props) {
  const isBioEmpty = bio === undefined || bio === ''

  return (
    <div
      className={`relative transform transition-all duration-200 hover:scale-103 hover:drop-shadow-lg ${cardBaseClasses}`}
    >
      <div className={flexContainerClasses}>
        <Avatar name={name} avatarUrl={avatarUrl} size={avatarSize} />
        <div className={`min-w-0 ${contentContainerBaseClasses}`}>
          <h2 className="truncate text-lg font-bold">{name}</h2>
          <p
            className={`line-clamp-2 h-10 text-sm break-words ${
              isBioEmpty ? 'text-gray-500' : ''
            }`}
          >
            {isBioEmpty ? '自己紹介は登録されていません...' : bio}
          </p>
        </div>
      </div>
      {children}
      <Link
        href={`/users/profile/${id}`}
        className="absolute top-0 left-0 h-full w-full rounded-md"
        aria-label={`${name}の詳細画面を表示`}
      />
    </div>
  )
}

type LoadingUserCardProps = Pick<Props, 'children'>

export function LoadingUserCard({ children }: LoadingUserCardProps) {
  return (
    <div className={cardBaseClasses}>
      <div className={flexContainerClasses}>
        <div>
          <LoadingAvatar size={avatarSize} />
        </div>
        <div className={`w-full ${contentContainerBaseClasses}`}>
          <div className="skeleton my-1 h-6 w-1/3 rounded-lg" />
          <div className="w-full space-y-1">
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-4 w-2/3 rounded-full" />
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
