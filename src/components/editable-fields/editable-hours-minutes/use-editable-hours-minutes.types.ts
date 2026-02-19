import type { FieldValues, SubmitHandler } from 'react-hook-form'
import type { ZodSchema } from 'zod'

export type UseEditableHoursMinutesParams = {
  editorRef: React.RefObject<HTMLInputElement | null>
  currentUserId: string
  hoursFieldName: string
  minutesFieldName: string
  schema: ZodSchema & { _def: { typeName: string } }
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
