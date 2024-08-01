import { Button } from '@/components/buttons/button'
import { HorizontalRule } from '@/components/horizontal-rule'

type Props = {
  message: string
  resetButton?: React.ReactElement
  reportIssueLink: React.ReactElement
  children?: React.ReactNode
}

export function ErrorContent({
  message,
  resetButton,
  reportIssueLink,
  children,
}: Props) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center">
      <p className="text-center-auto">{message}</p>
      {(children ?? resetButton) && (
        <div className="mt-7">
          <div className="mb-7 space-y-3">
            {children}
            {resetButton}
          </div>
          <HorizontalRule>上記を試しても解決しない場合</HorizontalRule>
        </div>
      )}
      <div className="mt-4 flex flex-col items-center">
        <Button
          type="button"
          className="btn-ghost mb-3"
          onClick={() => location.reload()}
        >
          ページ全体を再読み込み
        </Button>
        {reportIssueLink}
      </div>
    </div>
  )
}
