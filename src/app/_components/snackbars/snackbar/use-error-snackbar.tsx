import { useCallback } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { ReportIssueLink } from '@/components/report-issue-link'
import { ContentTypeError } from '@/utils/error/custom/content-type-error'
import { HttpError } from '@/utils/error/custom/http-error'
import { NetworkError } from '@/utils/error/custom/network-error'
import { UnexpectedError } from '@/utils/error/custom/unexpected-error'
import { ValidationError } from '@/utils/error/custom/validation-error'

type Errors =
  | ContentTypeError
  | HttpError
  | NetworkError
  | UnexpectedError
  | ValidationError

const criticalErrors = [ContentTypeError, ValidationError, UnexpectedError]

function isFatalError(err: Errors) {
  const isCriticalError = criticalErrors.some(
    (criticalError) => err instanceof criticalError
  )
  const isServerError = err instanceof HttpError && err.status >= 500

  return isCriticalError || isServerError
}

export function useErrorSnackbar() {
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)

  const openErrorSnackbar = useCallback(
    (err: Errors) => {
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
    [openSnackbar]
  )

  return { openErrorSnackbar }
}
