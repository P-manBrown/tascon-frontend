import { BioCollapsibleSection } from '@/components/collapsible-sections/bio-collapsible-section'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { BioEditor } from './bio-editor'

const height = 160

export async function EditableBio() {
  const { account: currentUser } = await getCurrentUser()
  const currentUserId = currentUser.id.toString()

  return (
    <BioEditor
      currentUserId={currentUserId}
      initialBio={currentUser.bio}
      label={<DetailItemHeading>自己紹介</DetailItemHeading>}
      privacyTag={<Tag color="gray">公開</Tag>}
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
    >
      {/* Pass 'key' so that the bio is re-rendered when it is re-validated */}
      <BioCollapsibleSection key={currentUser.bio} height={height}>
        <DetailItemContentLayout>
          {currentUser.bio === '' || currentUser.bio === undefined ? (
            <p className="text-gray-500">自己紹介を登録してください...</p>
          ) : (
            <DetailMultiLineText>{currentUser.bio}</DetailMultiLineText>
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
