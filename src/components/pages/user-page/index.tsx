import Link from 'next/link'
import { Avatar, LoadingAvatar } from '@/components/avatars/avatar'
import { BioCollapsibleSection } from '@/components/collapsible-sections/bio-collapsible-section'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { HorizontalRule } from '@/components/horizontal-rule'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import {
  DetailMultiLineText,
  LoadingDetailMultiLineText,
} from '@/components/texts/detail-multi-line-text'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getUser } from '@/utils/api/server/get-user'
import { DeleteContactButton } from './delete-contact-button'
import {
  EditableDisplayName,
  LoadingEditableDisplayName,
} from './editable-display-name'
import { EditableNote, LoadingEditableNote } from './editable-note'

type Props = {
  id: string
}

const userInfoLayoutClasses = 'flex flex-col space-y-10'
const avatarLayoutClasses = 'flex justify-center'
const avatarSize = 128
const bioCollapsibleHeight = 160

export async function UserPage({ id }: Props) {
  const { user } = await getUser(id)

  return (
    <div className={userInfoLayoutClasses}>
      <div className={avatarLayoutClasses}>
        <Avatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          size={avatarSize}
          priority={true}
        />
      </div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>ユーザー名</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <DetailSingleLineText>{user.name}</DetailSingleLineText>
      </DetailItemContentLayout>
      <DetailItemHeadingLayout>
        <DetailItemHeading>自己紹介</DetailItemHeading>
      </DetailItemHeadingLayout>
      <BioCollapsibleSection height={bioCollapsibleHeight}>
        <DetailItemContentLayout>
          {user.bio === undefined || user.bio === '' ? (
            <p className="text-gray-500">自己紹介は登録されていません...</p>
          ) : (
            <DetailMultiLineText>{user.bio}</DetailMultiLineText>
          )}
        </DetailItemContentLayout>
      </BioCollapsibleSection>
      <HorizontalRule />
      {user.currentUserContact === undefined ? (
        <div className="rounded-sm bg-gray-100 p-6">
          <p>
            このユーザーは登録されていません。
            <br />
            登録すると表示名やメモが設定できるようになります。
            <br />
            「登録しているユーザー一覧」ページで登録できます。
          </p>
          <Link href="/users/contacts" className="btn btn-success mt-6">
            登録しているユーザー一覧
          </Link>
        </div>
      ) : (
        <>
          <EditableDisplayName
            contactId={user.currentUserContact.id.toString()}
            displayName={user.currentUserContact.displayName}
          />
          <EditableNote
            contactId={user.currentUserContact.id.toString()}
            note={user.currentUserContact.note}
          />
          <DetailItemContentLayout>
            <DeleteContactButton
              contactId={user.currentUserContact.id.toString()}
              contactUserId={user.id.toString()}
            />
          </DetailItemContentLayout>
        </>
      )}
    </div>
  )
}

export function LoadingUserPage() {
  return (
    <div className={userInfoLayoutClasses}>
      <div className={avatarLayoutClasses}>
        <LoadingAvatar size={avatarSize} />
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>ユーザー名</DetailItemHeading>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingDetailSingleLineText />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>自己紹介</DetailItemHeading>
        </DetailItemHeadingLayout>
        <div style={{ height: `${bioCollapsibleHeight}px` }}>
          <DetailItemContentLayout>
            <LoadingDetailMultiLineText lines={6} />
          </DetailItemContentLayout>
        </div>
      </div>
      <HorizontalRule />
      <LoadingEditableDisplayName />
      <LoadingEditableNote />
      <DetailItemContentLayout>
        <div className="skeleton shape-btn" />
      </DetailItemContentLayout>
    </div>
  )
}
