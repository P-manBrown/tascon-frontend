'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { taskSchema } from '@/schemas/response/task'
import { ErrorObject } from '@/types/error'
import { changeTaskStatus } from '@/utils/api/change-task-status'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { TASK_STATUS_LABELS } from '@/utils/task/task-status-labels'
import { isValidValue } from '@/utils/type-guard/is-valid-value'

type Props = {
  taskId: string
  initialStatus: 'not_started' | 'in_progress' | 'completed'
  layoutClasses: string
}

const statusSchema = taskSchema.shape.task.shape.status

export function TaskStatusEditor({
  taskId,
  initialStatus,
  layoutClasses,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 401) {
      router.push(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = ev.target.value

    if (isValidValue(statusSchema, newStatus)) {
      startTransition(async () => {
        const result = await changeTaskStatus({
          taskId,
          bodyData: { status: newStatus },
        })
        if (result.status === 'error') {
          if (result.name === 'HttpError') {
            handleHttpError(result)
          } else {
            openErrorSnackbar(result)
          }
        }
      })
    }
  }

  return (
    <fieldset disabled={isPending} className={layoutClasses}>
      {Object.entries(TASK_STATUS_LABELS).map(([statusValue, statusLabel]) => (
        <label
          key={statusValue}
          className={`flex items-center gap-1 ${isPending ? 'cursor-wait' : ''}`}
        >
          <input
            type="radio"
            name={`task-status-${taskId}`}
            value={statusValue}
            checked={initialStatus === statusValue}
            onChange={handleChange}
            disabled={isPending}
            className={`size-4 ${isPending ? 'animate-pulse cursor-wait' : ''}`}
          />
          <span className="text-sm">{statusLabel}</span>
        </label>
      ))}
    </fieldset>
  )
}
