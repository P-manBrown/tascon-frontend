import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { LoadingAvatar } from '@/components/avatars/avatar'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import { LoadingDetailMultiLineText } from '@/components/texts/detail-multi-line-text'
import { LoadingDetailSingleLineText } from '@/components/texts/detail-single-line-text'
import { validateToken } from '@/utils/api/server/validate-token'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateRedirectLoginPath } from '@/utils/login-path/generate-redirect-login-path.server'
import { ChangePasswordLink } from './change-password-link'
import { EditableAvatar, LoadingEditableAvatar } from './editable-avatar'
import { EditableBio } from './editable-bio/bio-editor'
import { EditableEmail } from './editable-email'
import { EditableName, LoadingEditableName } from './editable-name'
import { PrivateModeSwitch } from './private-mode-switch'
import { LoadingToggleSwitch } from './private-mode-switch/toggle-switch'

const bioHeight = 160
const descriptionLayoutClasses = 'ml-3 align-middle'

export async function CurrentUserInfo() {
  const handleHttpError = (err: HttpError) => {
    if (err.status === 401) {
      const redirectLoginPath = generateRedirectLoginPath()
      redirect(redirectLoginPath)
    }

    throw err
  }

  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    if (validateTokenResult instanceof HttpError) {
      handleHttpError(validateTokenResult)
    }

    throw validateTokenResult
  }
  const { data: currentUser } = validateTokenResult
  const currentUserId = currentUser.id.toString()

  const getCsrfTokenResult = getCsrfToken()
  if (getCsrfTokenResult instanceof Error) {
    throw getCsrfTokenResult
  }
  const csrfToken = getCsrfTokenResult

  return (
    <>
      <div className="flex justify-center">
        <Suspense fallback={<LoadingEditableAvatar />}>
          <EditableAvatar csrfToken={csrfToken} />
        </Suspense>
      </div>
      <Suspense fallback={<LoadingEditableName />}>
        <EditableName csrfToken={csrfToken} />
      </Suspense>
      <EditableBio
        currentUserId={currentUserId}
        initialBio={currentUser.bio}
        label={<DetailItemHeading>自己紹介</DetailItemHeading>}
        privacyTag={<Tag color="gray">公開</Tag>}
        unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
        height={bioHeight}
        csrfToken={csrfToken}
      />
      <EditableEmail
        currentUserId={currentUserId}
        provider={currentUser.provider}
        initialEmail={currentUser.email}
        label={<DetailItemHeading>メールアドレス</DetailItemHeading>}
        privacyTag={<Tag color="gray">非公開</Tag>}
        unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>}
        csrfToken={csrfToken}
      />
      <PrivateModeSwitch
        initialIsPrivate={currentUser.isPrivate}
        label={<DetailItemHeading>プライベートモード</DetailItemHeading>}
        privacyTag={<Tag color="gray">非公開</Tag>}
        description={
          <span className={descriptionLayoutClasses}>
            メールアドレスでの検索・登録を拒否する
          </span>
        }
        csrfToken={csrfToken}
      />
      {currentUser.provider === 'email' && <ChangePasswordLink />}
    </>
  )
}

export function LoadingCurrentUserInfo() {
  return (
    <>
      <div className="flex justify-center">
        <LoadingAvatar size={128} />
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>ユーザー名</DetailItemHeading>
          <Tag color="gray">公開</Tag>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingDetailSingleLineText />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>自己紹介</DetailItemHeading>
          <Tag color="gray">公開</Tag>
        </DetailItemHeadingLayout>
        <div style={{ height: bioHeight }}>
          <DetailItemContentLayout>
            <LoadingDetailMultiLineText lines={6} />
          </DetailItemContentLayout>
        </div>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>メールアドレス</DetailItemHeading>
          <Tag color="gray">非公開</Tag>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingDetailSingleLineText />
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>プライベートモード</DetailItemHeading>
          <Tag color="gray">非公開</Tag>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <LoadingToggleSwitch />
          <span className={descriptionLayoutClasses}>
            メールアドレスでの検索・登録を拒否する
          </span>
        </DetailItemContentLayout>
      </div>
    </>
  )
}
