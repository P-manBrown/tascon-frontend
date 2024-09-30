import { useCallback } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { ReportIssueLink } from '@/components/report-issue-link'
import type { ErrorObject, Errors } from '@/types/error'

const criticalErrorNames = [
  'ContentTypeError',
  'ValidationError',
  'UnexpectedError',
]

function isFatalError(err: ErrorObject<Errors>) {
  const isCriticalError = criticalErrorNames.some(
    (criticalErrorName) => err.name === criticalErrorName,
  )
  const isServerError = err.name === 'HttpError' && err.statusCode >= 500

  return isCriticalError || isServerError
}

export function useErrorSnackbar() {
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)

  const openErrorSnackbar = useCallback(
    (err: ErrorObject<Errors>) => {
      openSnackbar({
        severity: 'error',
        message: isFatalError(err)
          ? '予期せぬエラーが発生しました。問題を報告してください。'
          : err.message,
        actionButton: isFatalError(err) ? (
          <ReportIssueLink info={`Request ID: ${err.requestId}`} />
        ) : undefined,
      })
    },
    [openSnackbar],
  )

  return { openErrorSnackbar }
}
