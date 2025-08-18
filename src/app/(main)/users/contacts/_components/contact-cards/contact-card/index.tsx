import Link from 'next/link'
import { Avatar, LoadingAvatar } from '@/components/avatars/avatar/index'

const avatarSize = 64

const cardBaseClasses =
  'rounded-md border border-gray-300 bg-white p-6 drop-shadow-sm'
const flexContainerClasses = 'flex items-center gap-4'
const contentContainerBaseClasses = 'flex flex-col gap-1'
const memoSectionBaseClasses =
  'rounded-sm bg-gray-100 p-3 mt-3 flex flex-col gap-1'
const memoTitleClasses = 'text-xs font-bold'

type Props = {
  displayName?: string
  note?: string
  contactUserId: number
  contactUserName: string
  bio?: string
  avatarUrl?: string
}

export function ContactCard({
  displayName,
  note,
  contactUserId,
  contactUserName,
  bio,
  avatarUrl,
}: Props) {
  const isBioEmpty = bio === undefined || bio === ''
  const isNoteEmpty = note === undefined || note === ''

  return (
    <Link
      href={`/users/profile/${contactUserId}`}
      className={`block transform transition-all duration-200 hover:scale-103 hover:drop-shadow-lg ${cardBaseClasses}`}
    >
      <div className={flexContainerClasses}>
        <Avatar
          name={contactUserName}
          avatarUrl={avatarUrl}
          size={avatarSize}
        />
        <div className={`min-w-0 ${contentContainerBaseClasses}`}>
          <h2 className="truncate text-lg font-bold">
            {displayName == undefined || displayName === ''
              ? contactUserName
              : displayName}
          </h2>
          <p
            className={`line-clamp-2 h-10 text-sm ${
              isBioEmpty ? 'text-gray-500' : ''
            }`}
          >
            {isBioEmpty ? '自己紹介は登録されていません...' : bio}
          </p>
        </div>
      </div>
      <div className={memoSectionBaseClasses}>
        <h3 className={memoTitleClasses}>メモ</h3>
        <p
          className={`line-clamp-2 h-10 text-sm ${isNoteEmpty ? 'text-gray-600/85' : ''}`}
        >
          {isNoteEmpty ? 'メモは登録されていません...' : note}
        </p>
      </div>
    </Link>
  )
}

export function LoadingContactCard() {
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
      <div className={`w-full ${memoSectionBaseClasses}`}>
        <h3 className={memoTitleClasses}>メモ</h3>
        <div className="mt-1 w-full space-y-1">
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-2/3 rounded-full" />
        </div>
      </div>
    </div>
  )
}
