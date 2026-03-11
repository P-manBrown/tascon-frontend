import { NotFoundContent } from '@/components/contents/not-found-content'
import { IconMessage } from '@/components/icon-message'

export default function NotFound() {
  return (
    <IconMessage severity="error" title="Not Found">
      <NotFoundContent message="タスクが見つかりませんでした。" />
    </IconMessage>
  )
}
