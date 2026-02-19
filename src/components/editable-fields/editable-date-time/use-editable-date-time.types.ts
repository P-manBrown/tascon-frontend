import type { FieldValues, SubmitHandler } from 'react-hook-form'
import type { ZodSchema } from 'zod'

export type UseEditableDateTimeParams = {
  editorRef: React.RefObject<HTMLInputElement | null>
  currentUserId: string
  dateFieldName: string
  timeFieldName: string
  schema: ZodSchema & { _def: { typeName: string } }
  defaultDate?: string
  defaultTime?: string
  shouldSaveToLocalStorage: boolean
}

export type FormSubmitHandler<T extends FieldValues> = (
  onSubmit: SubmitHandler<T>,
) => (ev: React.SyntheticEvent) => Promise<void>

export type BlurHandler<T extends FieldValues> = (
  onSubmit: SubmitHandler<T>,
) => (ev: React.FocusEvent<HTMLFormElement>) => Promise<void>
