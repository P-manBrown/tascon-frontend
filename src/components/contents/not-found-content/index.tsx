import { HorizontalRule } from '@/components/horizontal-rule'
import { ReportIssueLink } from '@/components/links/report-issue-link'

type Props = {
  message: string
  link?: React.ReactElement
  children?: React.ReactNode
}

export function NotFoundContent({ message, link, children }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center">
      <p className="text-center-auto">{message}</p>
      {children && (
        <div className="mt-7">
          <div className="mb-7">{children}</div>
          <HorizontalRule>上記を試しても解決しない場合</HorizontalRule>
        </div>
      )}
      <div className="mt-7 flex flex-col items-center">
        {link}
        <ReportIssueLink />
      </div>
    </div>
  )
}
