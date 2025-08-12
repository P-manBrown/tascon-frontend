import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
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
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import {
  CurrentUserRegistraterContactButton,
  LoadingCurrentUserRegistraterContactButton,
} from './current-user-register-contact-button'
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
  const handleHttpError = async (err: HttpError) => {
    if (err.statusCode === 401) {
      const redirectLoginPath = await generateRedirectLoginPath()
      redirect(redirectLoginPath)
    } else if (err.statusCode === 404) {
      notFound()
    }

    throw err
  }

  const result = await getUser(id)
  if (result instanceof Error) {
    if (result instanceof HttpError) {
      handleHttpError(result)
    }

    throw result
  }
  const { user } = result

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
        <DetailItemContentLayout>
          <div className="rounded-sm bg-gray-100 p-6">
            <div className="mb-3">
              <p>
                このユーザーは登録されていません。
                <br />
                ユーザーを登録すると以下ができるようになります。
              </p>
              <ul className="list-inside list-disc p-3">
                <li>表示名の設定</li>
                <li>メモの登録</li>
                <li>チャット</li>
                <li>テンプレートの共有</li>
              </ul>
            </div>
            <Suspense fallback={<LoadingCurrentUserRegistraterContactButton />}>
              <CurrentUserRegistraterContactButton
                userId={user.id.toString()}
              />
            </Suspense>
          </div>
        </DetailItemContentLayout>
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
