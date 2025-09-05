import { UserCard, LoadingUserCard } from '@/components/user-card'

type Props = {
  id: number
  name: string
  bio?: string
  avatarUrl?: string
  displayName?: string
  note?: string
}

const memoSectionBaseClasses =
  'rounded-sm bg-gray-100 p-3 mt-3 flex flex-col gap-1'
const memoTitleClasses = 'text-xs font-bold'

export function ContactCard({
  displayName,
  note,
  id,
  name,
  bio,
  avatarUrl,
}: Props) {
  const userName =
    displayName == undefined || displayName === '' ? name : displayName
  const isNoteEmpty = note === undefined || note === ''

  return (
    <UserCard id={id} name={userName} bio={bio} avatarUrl={avatarUrl}>
      <div className={memoSectionBaseClasses}>
        <h2 className={memoTitleClasses}>メモ</h2>
        <p
          className={`line-clamp-2 h-10 text-sm break-words ${
            isNoteEmpty ? 'text-gray-600/85' : ''
          }`}
        >
          {isNoteEmpty ? 'メモは登録されていません...' : note}
        </p>
      </div>
    </UserCard>
  )
}

export function LoadingContactCard() {
  return (
    <LoadingUserCard>
      <div className={`w-full ${memoSectionBaseClasses}`}>
        <h2 className={memoTitleClasses}>メモ</h2>
        <div className="mt-1 w-full space-y-1">
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-2/3 rounded-full" />
        </div>
      </div>
    </LoadingUserCard>
  )
}
