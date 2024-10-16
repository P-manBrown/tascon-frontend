import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import { validateToken } from '@/utils/api/server/validate-token'
import { BioCollapsibleSection } from './bio-collapsible-section'
import { BioEditor } from './bio-editor'

type Props = {
  csrfToken: string
}

const height = 160

export async function EditableBio({ csrfToken }: Props) {
  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    throw validateTokenResult
  }
  const { id, bio } = validateTokenResult.data

  return (
    <BioEditor
      currentUserId={id.toString()}
      initialBio={bio}
      label={<DetailItemHeading>自己紹介</DetailItemHeading>}
      privacyTag={<Tag color="gray">公開</Tag>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
      csrfToken={csrfToken}
    >
      {/* Pass 'key' so that the bio is re-rendered when it is re-validated */}
      <BioCollapsibleSection key={bio} height={height}>
        <DetailItemContentLayout>
          {bio === '' ? (
            <p className="text-gray-500">自己紹介を登録してください...</p>
          ) : (
            <DetailMultiLineText>{bio}</DetailMultiLineText>
          )}
        </DetailItemContentLayout>
      </BioCollapsibleSection>
    </BioEditor>
  )
}

export function LoadingEditableBio() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>自己紹介</DetailItemHeading>
        <Tag color="gray">公開</Tag>
      </DetailItemHeadingLayout>
      <div style={{ height: `${height}px` }}>
        <DetailItemContentLayout>
          <LoadingDetailMultiLineText lines={6} />
        </DetailItemContentLayout>
      </div>
    </div>
  )
}
