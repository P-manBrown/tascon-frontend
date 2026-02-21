import { z } from 'zod'
import { taskGroupSchema } from '@/schemas/response/task-group'
import { userSchema } from '@/schemas/response/user'

const ownerSchema = userSchema.shape.user.omit({
  contact: true,
  is_suggested: true,
  block: true,
})

const taskGroupWithOwnerSchema = taskGroupSchema.shape.task_group.extend({
  owner: ownerSchema,
})

export const taskGroupShareSchema = z.object({
  id: z.number(),
  task_group: taskGroupWithOwnerSchema,
})
