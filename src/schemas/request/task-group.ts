import { z } from 'zod'
import { countCharacters } from '@/utils/string-count/count-characters'

export const taskGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'グループ名を入力してください。')
    .refine((value) => countCharacters(value) <= 255, {
      message: '255文字以下で入力してください。',
    }),
  note: z
    .string()
    .trim()
    .refine((value) => countCharacters(value) <= 1000, {
      message: '最大文字数を超えています。',
    }),
})
