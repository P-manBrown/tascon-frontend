'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { taskSchema } from '@/schemas/response/task'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { isValidValue } from '@/utils/type-guard/is-valid-value'
import { changeTaskStatus } from './change-task-status.api'

type Props = {
  taskId: string
  initialStatus: 'not_started' | 'in_progress' | 'completed'
  layoutClasses: string
}

const statusSchema = taskSchema.shape.task.shape.status

type Status = z.infer<typeof statusSchema>

const statusLabels: Record<Status, string> = {
  not_started: '未着手',
  in_progress: '対応中',
  completed: '完了',
}

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
      {Object.entries(statusLabels).map(([statusValue, statusLabel]) => (
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
