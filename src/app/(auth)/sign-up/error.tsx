'use client'

import { ErrorContent } from '@/components/contents/error-content'
import { IconMessage } from '@/components/icon-message'
import { ReportIssueLink } from '@/components/links/report-issue-link'
import type { ErrorProps } from '@/types/error'

export default function Error({ error }: ErrorProps) {
  return (
    <IconMessage severity="error" title="Error">
      <ErrorContent
        message="新規登録画面の表示中に問題が発生しました。"
        reportIssueLink={<ReportIssueLink info={`Digest: ${error.digest}`} />}
      />
    </IconMessage>
  )
}
