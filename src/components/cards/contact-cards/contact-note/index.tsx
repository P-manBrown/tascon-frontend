type Props = {
  note?: string
}

const noteSectionBaseClasses =
  'rounded-sm bg-gray-100 p-3 mt-3 flex flex-col gap-1'
const noteTitleClasses = 'text-xs font-bold'

export function ContactNote({ note }: Props) {
  const isNoteEmpty = note === undefined || note === ''

  return (
    <div className={noteSectionBaseClasses}>
      <h2 className={noteTitleClasses}>メモ</h2>
      <p
        className={`line-clamp-2 h-10 text-sm break-words ${
          isNoteEmpty ? 'text-gray-600/85' : ''
        }`}
      >
        {isNoteEmpty ? 'メモは登録されていません...' : note}
      </p>
    </div>
  )
}

export function LoadingContactNote() {
  return (
    <div className={`w-full ${noteSectionBaseClasses}`}>
      <h2 className={noteTitleClasses}>メモ</h2>
      <div className="mt-1 w-full space-y-1">
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-2/3 rounded-full" />
      </div>
    </div>
  )
}
