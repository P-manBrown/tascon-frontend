import { z } from "zod";
import { taskGroupBaseSchema } from "@/schemas/response/task-group";
import { userSchema } from "@/schemas/response/user";

const taskGroupShareUserSchema = userSchema.shape.user.omit({
  contact: true,
  is_suggested: true,
  block: true,
});

const taskGroupWithOwnerSchema = taskGroupBaseSchema.shape.task_group.extend({
  owner: taskGroupShareUserSchema,
});

export const taskGroupShareStatusSchema = z.enum([
  "shared",
  "handover_pending",
]);

export const taskGroupShareSchema = z.object({
  task_group_share: z.object({
    id: z.number(),
    status: taskGroupShareStatusSchema,
    user: taskGroupShareUserSchema,
    task_group: taskGroupWithOwnerSchema,
  }),
});
