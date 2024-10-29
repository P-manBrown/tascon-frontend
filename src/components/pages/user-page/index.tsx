import { notFound, redirect } from 'next/navigation'
import { Avatar, LoadingAvatar } from '@/components/avatars/avatar'
import { DetailItemHeading } from '@/components/headings/detail-item-heading'
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

type Props = {
  id: string
}

const userInfoLayoutClasses = 'flex flex-col space-y-10'
const avatarLayoutClasses = 'flex justify-center'
const avatarSize = 128

export async function UserPage({ id }: Props) {
  const handleHttpError = (err: HttpError) => {
    if (err.statusCode === 401) {
      const redirectLoginPath = generateRedirectLoginPath()
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
      <DetailItemContentLayout>
        {user.bio === '' ? (
          <p className="text-gray-500">自己紹介は登録されていません...</p>
        ) : (
          <DetailMultiLineText>{user.bio}</DetailMultiLineText>
        )}
      </DetailItemContentLayout>
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
        <DetailItemContentLayout>
          <LoadingDetailMultiLineText lines={5} />
        </DetailItemContentLayout>
      </div>
    </div>
  )
}
