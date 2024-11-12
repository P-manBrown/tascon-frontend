import { Suspense } from 'react'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
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
  return (
    <>
      <div className="flex justify-center">
        <Suspense fallback={<LoadingEditableAvatar />}>
          <EditableAvatar />
        </Suspense>
      </div>
      <Suspense fallback={<LoadingEditableName />}>
        <EditableName />
      </Suspense>
      <Suspense fallback={<LoadingEditableBio />}>
        <EditableBio />
      </Suspense>
      <Suspense fallback={<LoadingEditableEmail />}>
        <EditableEmail />
      </Suspense>
      <div>
        <DetailItemHeadingLayout>
          <DetailItemHeading>プライベートモード</DetailItemHeading>
          <Tag color="gray">非公開</Tag>
        </DetailItemHeadingLayout>
        <DetailItemContentLayout>
          <Suspense fallback={<LoadingPrivateModeSwitch />}>
            <PrivateModeSwitch />
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
