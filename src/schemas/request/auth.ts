import { z } from 'zod'
import { countCharacters } from '@/utils/string-count/count-characters'

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'ユーザー名を入力してください。')
    .refine((value) => countCharacters(value) <= 255, {
      message: '255文字以下で入力してください。',
    }),
  email: z
    .string()
    .trim()
    .min(1, 'メールアドレスを入力してください。')
    .email('正しいメールアドレスを入力してください。')
    .refine((value) => countCharacters(value) <= 100, {
      message: '100文字以下で入力してください。',
    }),
  password: z
    .string()
    .trim()
    .min(1, 'パスワードを入力してください。')
    .refine((value) => countCharacters(value) >= 6, {
      message: '6文字以上で入力してください。',
    })
    .refine((value) => countCharacters(value) <= 128, {
      message: '128文字以下で入力してください。',
    }),
})

export const loginSchema = signUpSchema.pick({ email: true, password: true })

export const resetPasswordSchema = signUpSchema.pick({ email: true })

export const changePasswordSchema = signUpSchema
  .pick({ password: true })
  .extend({
    currentPassword: signUpSchema.shape.password,
  })
