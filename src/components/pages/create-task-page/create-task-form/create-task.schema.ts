import z from 'zod'
import { countCharacters } from '@/utils/string-count/count-characters'

type transformDateTimeToIsoParams = {
  date: string | undefined
  time: string | undefined
  defaultTime: string
}

type transformHoursMinutesToMinutesParams = {
  hours: number | undefined
  minutes: number | undefined
}

function transformDateTimeToIso({
  date,
  time,
  defaultTime,
}: transformDateTimeToIsoParams) {
  if (date === undefined || date === '') {
    return undefined
  }

  const timeValue = time !== undefined && time !== '' ? time : defaultTime
  console.log(timeValue)
  return `${date}T${timeValue}`
}

function transformHoursMinutesToMinutes({
  hours,
  minutes,
}: transformHoursMinutesToMinutesParams): number | undefined {
  const totalMinutes = (hours ?? 0) * 60 + (minutes ?? 0)
  return totalMinutes !== 0 ? totalMinutes : undefined
}

function validateEndDateAfterStartDate(
  startsAt: string | undefined,
  endsAt: string | undefined,
): boolean {
  if (startsAt === undefined || endsAt === undefined) {
    return true
  }

  return new Date(endsAt) > new Date(startsAt)
}

export const createTaskSchema = z.object({
  taskGroupId: z
    .number({ coerce: true })
    .gt(0, 'タスクグループを選択してください。'),
  name: z
    .string()
    .trim()
    .min(1, 'タスク名を入力してください。')
    .refine((value) => countCharacters(value) <= 255, {
      message: '255文字以下で入力してください。',
    }),
  duration: z
    .object({
      startsAt: z
        .object({
          startsAtDate: z.string().optional(),
          startsAtTime: z.string().optional(),
        })
        .transform((value) =>
          transformDateTimeToIso({
            date: value.startsAtDate,
            time: `${value.startsAtTime}:00`,
            defaultTime: '00:00:00',
          }),
        ),
      endsAt: z
        .object({
          endsAtDate: z.string().optional(),
          endsAtTime: z.string().optional(),
        })
        .transform((value) =>
          transformDateTimeToIso({
            date: value.endsAtDate,
            time: `${value.endsAtTime}:59`,
            defaultTime: '23:59:59',
          }),
        ),
    })
    .refine(
      (data) => validateEndDateAfterStartDate(data.startsAt, data.endsAt),
      {
        message: '開始日以降の日時を入力してください。',
        path: ['endsAt'],
      },
    ),
  estimatedTime: z
    .object({
      estimatedHours: z
        .number({ coerce: true })
        .int('時間には整数を入力してください。')
        .gte(0, '時間には0以上の数値を入力してください。')
        .optional(),
      estimatedMinutes: z
        .number({ coerce: true })
        .int('分には整数を入力してください。')
        .gte(0, '分には0以上の数値を入力してください。')
        .lte(59, '分には59以下の数値を入力してください。')
        .optional(),
    })
    .transform((value) =>
      transformHoursMinutesToMinutes({
        hours: value.estimatedHours,
        minutes: value.estimatedMinutes,
      }),
    ),
  note: z
    .string()
    .trim()
    .refine((value) => countCharacters(value) <= 1000, {
      message: '最大文字数を超えています。',
    })
    .optional(),
})
