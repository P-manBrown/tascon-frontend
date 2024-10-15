import type { FieldValues, SubmitHandler } from 'react-hook-form'
import type { ZodSchema } from 'zod'

export type UseEditableTextParams = {
  editorRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>
  currentUserId: string
  name: string
  schema: ZodSchema
  defaultValue: string
  shouldSaveToLocalStorage: boolean
}

export type FormSubmitHandler<T extends FieldValues> = (
  onSubmit: SubmitHandler<T>,
) => (ev: React.SyntheticEvent) => Promise<void>

export type BlurHandler<T extends FieldValues> = (
  onSubmit: SubmitHandler<T>,
) => (ev: React.FocusEvent<HTMLFormElement>) => Promise<void>
