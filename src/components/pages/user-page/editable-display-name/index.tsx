import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { Tag } from '@/components/tag'
import {
  DetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { DisplayNameEditor } from './display-name-editor'

type Props = Pick<
  React.ComponentProps<typeof DisplayNameEditor>,
  'contactId'
> & {
  displayName: string | undefined
}

export async function EditableDisplayName({ contactId, displayName }: Props) {
  const { account: currentUser } = await getCurrentUser()

  return (
    <DisplayNameEditor
      currentUserId={currentUser.id.toString()}
      contactId={contactId}
      initialDisplayName={displayName}
      label={<DetailItemHeading>表示名</DetailItemHeading>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <DetailItemContentLayout>
        {displayName === undefined || displayName === '' ? (
          <p className="text-gray-500">表示名を設定できます...</p>
        ) : (
          <DetailSingleLineText>{displayName}</DetailSingleLineText>
        )}
      </DetailItemContentLayout>
    </DisplayNameEditor>
  )
}
