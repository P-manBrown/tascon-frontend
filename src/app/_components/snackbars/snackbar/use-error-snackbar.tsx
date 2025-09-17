import { useCallback } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { ReportIssueLink } from '@/components/links/report-issue-link'
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
    (err: ErrorObject<Errors>, message?: string) => {
      let snackbarContent: Omit<Parameters<typeof openSnackbar>[0], 'severity'>
      if (isFatalError(err)) {
        snackbarContent = {
          message:
            message ?? '予期せぬエラーが発生しました。問題を報告してください。',
          actionButton: (
            <ReportIssueLink info={`Request ID: ${err.requestId}`} />
          ),
        }
      } else {
        snackbarContent = {
          message: message ?? err.message,
        }
      }

      openSnackbar({
        ...snackbarContent,
        severity: 'error',
      })
    },
    [openSnackbar],
  )

  return { openErrorSnackbar }
}
