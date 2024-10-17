import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { validateToken } from '@/utils/api/server/validate-token'
import { EmailEditor } from './email-editor'

type Props = {
  csrfToken: string
}

export async function EditableEmail({ csrfToken }: Props) {
  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    throw validateTokenResult
  }
  const { id, provider, email } = validateTokenResult.data

  return (
    <EmailEditor
      currentUserId={id.toString()}
      provider={provider}
      initialEmail={email}
      label={<DetailItemHeading>メールアドレス</DetailItemHeading>}
      privacyTag={<Tag color="gray">非公開</Tag>}
      csrfToken={csrfToken}
    >
      <DetailItemContentLayout>
        <DetailSingleLineText>{email}</DetailSingleLineText>
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
