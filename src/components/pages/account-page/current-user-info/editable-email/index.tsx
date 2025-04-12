import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { EmailEditor } from './email-editor'

export async function EditableEmail() {
  const { account: currentUser } = await getCurrentUser()
  const currentUserId = currentUser.id.toString()

  return (
    <EmailEditor
      currentUserId={currentUserId}
      provider={currentUser.provider}
      initialEmail={currentUser.email}
      label={<DetailItemHeading>メールアドレス</DetailItemHeading>}
      privacyTag={<Tag color="gray">非公開</Tag>}
    >
      <DetailItemContentLayout>
        <DetailSingleLineText>{currentUser.email}</DetailSingleLineText>
      </DetailItemContentLayout>
    </EmailEditor>
  )
}

export function LoadingEditableEmail() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>メールアドレス</DetailItemHeading>
        <Tag color="gray">非公開</Tag>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText />
      </DetailItemContentLayout>
    </div>
  )
}
