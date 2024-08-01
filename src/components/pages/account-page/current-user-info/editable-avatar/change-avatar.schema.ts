import { z } from 'zod'

export const changeAvatarSchema = z.object({
  avatar: z.custom<FileList>().superRefine((files, ctx) => {
    if (files.length === 0) {
      return true
    }

    if (!['image/png', 'image/jpeg'].includes(files[0].type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'PNG, JPEGのファイルを選択してください。',
      })
      return false
    }

    if (files[0].size > 2 * 1024 * 1024) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '2MB以下のファイルを選択してください。',
      })
      return false
    }
  }),
})
