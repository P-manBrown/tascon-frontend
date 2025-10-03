import { NotFoundContent } from '@/components/contents/not-found-content'
import { IconMessage } from '@/components/icon-message'

export default function NotFound() {
  return (
    <div className="mt-40">
      <IconMessage severity="error" title="Not Found">
        <NotFoundContent message="タスクグループが見つかりませんでした。" />
      </IconMessage>
    </div>
  )
}
