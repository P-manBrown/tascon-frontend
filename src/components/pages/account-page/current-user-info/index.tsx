import { Suspense } from 'react'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import { getCsrfToken } from '@/utils/cookie/get-csrf-token'
import {
  ChangePasswordLink,
  LoadingChangePasswordLink,
} from './change-password-link'
import { EditableAvatar, LoadingEditableAvatar } from './editable-avatar'
import { EditableBio, LoadingEditableBio } from './editable-bio'
import { LoadingEditableEmail, EditableEmail } from './editable-email'
import { EditableName, LoadingEditableName } from './editable-name'
import {
  LoadingPrivateModeSwitch,
  PrivateModeSwitch,
} from './private-mode-switch'

export function CurrentUserInfo() {
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
      <Suspense fallback={<LoadingEditableBio />}>
        <EditableBio csrfToken={csrfToken} />
      </Suspense>
      <Suspense fallback={<LoadingEditableEmail />}>
        <EditableEmail csrfToken={csrfToken} />
      </Suspense>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>プライベートモード</DetailItemHeading>
          <Tag color="gray">非公開</Tag>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <Suspense fallback={<LoadingPrivateModeSwitch />}>
            <PrivateModeSwitch csrfToken={csrfToken} />
          </Suspense>
        </DetailItemContentLayout>
      </div>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>パスワード</DetailItemHeading>
          <Tag color="gray">非公開</Tag>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <Suspense fallback={<LoadingChangePasswordLink />}>
            <ChangePasswordLink />
          </Suspense>
        </DetailItemContentLayout>
      </div>
    </>
  )
}
