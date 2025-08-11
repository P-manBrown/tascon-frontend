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

const height = 160

export async function EditableNote({ contactId, note }: Props) {
  const { account: currentUser } = await getCurrentUser()

  return (
    <NoteEditor
      currentUserId={currentUser.id.toString()}
      contactId={contactId}
      initialNote={note}
      label={<DetailItemHeading>メモ</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <NoteCollapsibleSection height={height}>
        <DetailItemContentLayout>
          {note === undefined || note === '' ? (
            <p className="text-gray-500">メモを登録できます...</p>
          ) : (
            <DetailMultiLineText>{note}</DetailMultiLineText>
          )}
        </DetailItemContentLayout>
      </NoteCollapsibleSection>
    </NoteEditor>
  )
}

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
