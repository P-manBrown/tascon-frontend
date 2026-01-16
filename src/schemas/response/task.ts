import { z } from 'zod'
import { taskGroupSchema } from './task-group'

export const taskBaseSchema = z.object({
  task: z.object({
    id: z.number(),
    name: z.string(),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    time_spent: z.number().optional(),
    estimated_minutes: z.number().optional(),
    note: z.string().optional(),
    status: z.enum(['not_started', 'in_progress', 'completed']),
  }),
})

export const taskSchema = z.object({
  task: taskBaseSchema.shape.task.extend({
    task_group: taskGroupSchema.shape.task_group,
  }),
})
