import type { FieldValues, SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

export type UseEditableHoursMinutesParams<T extends FieldValues = FieldValues> =
  {
    editorRef: React.RefObject<HTMLInputElement | null>
    currentUserId: string
    hoursFieldName: string
    minutesFieldName: string
    schema: z.core.$ZodType<T, FieldValues>
    defaultHours?: number
    defaultMinutes?: number
    shouldSaveToLocalStorage: boolean
  }

export type FormSubmitHandler<T extends FieldValues> = (
  onSubmit: SubmitHandler<T>,
) => (ev: React.SyntheticEvent) => Promise<void>

export type BlurHandler<T extends FieldValues> = (
  onSubmit: SubmitHandler<T>,
) => (ev: React.FocusEvent<HTMLFormElement>) => Promise<void>
