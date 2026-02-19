import { z } from 'zod'

export const changeAvatarSchema = z.object({
  avatar: z.custom<FileList>().superRefine((files, ctx) => {
    if (files.length === 0) {
      return
    }

    if (!['image/png', 'image/jpeg'].includes(files[0].type)) {
      ctx.addIssue({
        code: 'custom',
        message: 'PNG, JPEGのファイルを選択してください。',
      })
      return
    }

    if (files[0].size > 2 * 1024 * 1024) {
      ctx.addIssue({
        code: 'custom',
        message: '2MB以下のファイルを選択してください。',
      })
      return
    }
  }),
})
