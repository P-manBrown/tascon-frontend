import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { NoteCollapsibleSection } from './note-collapsible-section'
import { NoteEditor } from './note-editor'

type Props = Pick<React.ComponentProps<typeof NoteEditor>, 'contactId'> & {
  note: string | undefined
}

const height = 160 // メモセクションの高さ

// メモの編集可能なコンポーネント
export async function EditableNote({ contactId, note }: Props) {
  const { account: currentUser } = await getCurrentUser()

  return (
    <NoteEditor
      currentUserId={currentUser.id.toString()}
      contactId={contactId} // コンタクトID
      initialNote={note} // 初期メモ（nullの場合は空文字）
      label={<DetailItemHeading>メモ</DetailItemHeading>} // ラベル要素
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>} // 未保存変更タグ
    >
      <NoteCollapsibleSection height={height}>
        <DetailItemContentLayout>
          {note === undefined || note === '' ? (
            <p className="text-gray-500">メモを登録できます...</p> // メモ未設定時のプレースホルダー
          ) : (
            <DetailMultiLineText>{note}</DetailMultiLineText> // 設定済みのメモを表示
          )}
        </DetailItemContentLayout>
      </NoteCollapsibleSection>
    </NoteEditor>
  )
}

// ローディング状態のコンポーネント
export function LoadingEditableNote() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>メモ</DetailItemHeading>
      </DetailItemHeadingLayout>
      <div style={{ height: `${height}px` }}>
        <DetailItemContentLayout>
          <LoadingDetailMultiLineText lines={6} />
        </DetailItemContentLayout>
      </div>
    </div>
  )
}
