import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { validateToken } from '@/utils/api/server/validate-token'
import { NameEditor } from './name-editor'

type Props = {
  csrfToken: string
}

export async function EditableName({ csrfToken }: Props) {
  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    throw validateTokenResult
  }
  const { id, name } = validateTokenResult.data

  return (
    <NameEditor
      currentUserId={id.toString()}
      initialName={name}
      label={<DetailItemHeading>ユーザー名</DetailItemHeading>}
      privacyTag={<Tag color="gray">公開</Tag>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
      csrfToken={csrfToken}
    >
      <DetailItemContentLayout>
        <DetailSingleLineText>{name}</DetailSingleLineText>
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
