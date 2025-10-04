import { z } from 'zod'

export const taskGroupSchema = z.object({
  task_group: z.object({
    id: z.number(),
    name: z.string(),
    icon: z.string(),
    note: z.string().optional(),
  }),
})
