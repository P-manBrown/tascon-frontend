import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { ErrorObject } from '@/types/error'
import { changeTaskStatus } from '@/utils/api/change-task-status'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { TaskStatusSquare } from './status-square'

type Status = 'not_started' | 'in_progress' | 'completed'

type Props = {
  taskId: string
  taskName: string
  status: Status
}

const statusOrder: Status[] = ['not_started', 'in_progress', 'completed']

const statusLabels: Record<Status, string> = {
  not_started: '未着手',
  in_progress: '対応中',
  completed: '完了',
}

function getNextStatus(currentStatus: Status): Status {
  const currentIndex = statusOrder.indexOf(currentStatus)
  const nextIndex = (currentIndex + 1) % statusOrder.length
  return statusOrder[nextIndex]
}

export function TaskStatusButton({ taskId, taskName, status }: Props) {
  const [isPending, startTransition] = useTransition()
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const nextStatus = getNextStatus(status)
  const currentLabel = statusLabels[status]
  const nextLabel = statusLabels[nextStatus]

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 401) {
      router.push(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const handleClick = () => {
    startTransition(async () => {
      const result = await changeTaskStatus({
        taskId: taskId,
        bodyData: { status: nextStatus },
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

  return (
    <div
      className={`relative size-5 ${isPending ? 'animate-pulse cursor-not-allowed' : 'hover:brightness-75'}`}
    >
      <TaskStatusSquare status={status} />
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={`${taskName}のステータスを${currentLabel}から${nextLabel}に変更`}
        className="absolute inset-0"
      />
    </div>
  )
}
