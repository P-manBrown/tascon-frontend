'use client'

import { Button } from '@/components/buttons/button'
import { ErrorContent } from '@/components/contents/error-content'
import { IconMessage } from '@/components/icon-message'
import { ReportIssueLink } from '@/components/links/report-issue-link'
import type { ErrorProps } from '@/types/error'

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="mt-10 md:mt-20">
      <IconMessage severity="error" title="Error">
        <ErrorContent
          message="タスクグループ詳細画面の表示中に問題が発生しました。"
          resetButton={
            <Button type="button" className="btn-success" onClick={reset}>
              再読み込み
            </Button>
          }
          reportIssueLink={<ReportIssueLink info={`Digest: ${error.digest}`} />}
        />
      </IconMessage>
    </div>
  )
}
