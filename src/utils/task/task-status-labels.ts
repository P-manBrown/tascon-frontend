import type { taskSchema } from '@/schemas/response/task'
import type { z } from 'zod'

type TaskStatus = z.infer<typeof taskSchema.shape.task.shape.status>

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: '未着手',
  in_progress: '対応中',
  completed: '完了',
}
