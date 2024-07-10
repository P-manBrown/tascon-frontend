import { NotFoundContent } from '@/components/contents/not-found-content'
import { IconMessage } from '@/components/icon-message'

export function UserNotFoundPage() {
  return (
    <IconMessage severity="error" title="Not Found">
      <NotFoundContent message="ユーザーが見つかりませんでした。" />
    </IconMessage>
  )
}
