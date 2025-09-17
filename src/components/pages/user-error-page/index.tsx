import { Button } from '@/components/buttons/button'
import { ErrorContent } from '@/components/contents/error-content'
import { IconMessage } from '@/components/icon-message'
import { ReportIssueLink } from '@/components/links/report-issue-link'
import type { ErrorProps } from '@/types/error'

export function UserErrorPage({ error, reset }: ErrorProps) {
  return (
    <IconMessage severity="error" title="Error">
      <ErrorContent
        message="ユーザー詳細画面の表示中に問題が発生しました。"
        resetButton={
          <Button type="button" className="btn-success" onClick={reset}>
            再読み込み
          </Button>
        }
        reportIssueLink={<ReportIssueLink info={`Digest: ${error.digest}`} />}
      />
    </IconMessage>
  )
}
