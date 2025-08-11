import { DetailItemHeading } from '@/components/headings/detail-item-heading'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { Tag } from '@/components/tag'
import {
  DetailSingleLineText,
  LoadingDetailSingleLineText,
} from '@/components/texts/detail-single-line-text'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { DisplayNameEditor } from './display-name-editor'

type Props = Pick<
  React.ComponentProps<typeof DisplayNameEditor>,
  'contactId'
> & {
  displayName: string | undefined
}

// 表示名の編集可能なコンポーネント
export async function EditableDisplayName({ contactId, displayName }: Props) {
  const { account: currentUser } = await getCurrentUser()

  return (
    <DisplayNameEditor
      currentUserId={currentUser.id.toString()}
      contactId={contactId} // コンタクトID
      initialDisplayName={displayName} // 初期表示名（nullの場合は空文字）
      label={<DetailItemHeading>表示名</DetailItemHeading>} // ラベル要素
      unsavedChangeTag={<Tag color="warning">未保存の変更あり</Tag>} // 未保存変更タグ
    >
      <DetailItemContentLayout>
        {displayName === undefined || displayName === '' ? (
          <p className="text-gray-500">表示名を設定できます...</p> // 表示名未設定時のプレースホルダー
        ) : (
          <DetailSingleLineText>{displayName}</DetailSingleLineText> // 設定済みの表示名を表示
        )}
      </DetailItemContentLayout>
    </DisplayNameEditor>
  )
}

// ローディング状態のコンポーネント
export function LoadingEditableDisplayName() {
  return (
    <div>
      <DetailItemHeadingLayout>
        <DetailItemHeading>表示名</DetailItemHeading>
      </DetailItemHeadingLayout>
      <DetailItemContentLayout>
        <LoadingDetailSingleLineText /> {/* ローディング中のテキスト表示 */}
      </DetailItemContentLayout>
    </div>
  )
}
