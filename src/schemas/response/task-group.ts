import { z } from "zod";
import { userSchema } from "@/schemas/response/user";

const sharedUserSchema = userSchema.shape.user.omit({
  avatar_url: true,
  contact: true,
  is_suggested: true,
  block: true,
});

export const taskGroupBaseSchema = z.object({
  task_group: z.object({
    id: z.number(),
    name: z.string(),
    icon: z.string(),
    note: z.string().optional(),
  }),
});

export const taskGroupSchema = z.object({
  task_group: taskGroupBaseSchema.shape.task_group.extend({
    shared_users: z.array(sharedUserSchema),
  }),
});
