import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { NameEditor } from './name-editor'

export async function EditableName() {
  const { account: currentUser } = await getCurrentUser()
  const currentUserId = currentUser.id.toString()

  return (
    <NameEditor
      currentUserId={currentUserId}
      initialName={currentUser.name}
      label={<DetailItemHeading>ユーザー名</DetailItemHeading>}
      privacyTag={<Tag color="gray">公開</Tag>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      <DetailItemContentLayout>
        <DetailSingleLineText>{currentUser.name}</DetailSingleLineText>
      </DetailItemContentLayout>
    </NameEditor>
  )
}

export function LoadingEditableName() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>ユーザー名</DetailItemHeading>
        <Tag color="gray">公開</Tag>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
