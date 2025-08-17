import { useCallback } from 'react'
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

type FormErrorItem<T extends FieldValues = FieldValues> = {
  attribute: FieldPath<T>
  type: string
  full_message: string
}

type FormErrors<T extends FieldValues = FieldValues> = {
  shouldFocus?: boolean
} & (
  | {
      errors: Array<FormErrorItem<T>>
    }
  | {
      error: FormErrorItem<T>
    }
)

export function useHandleFormErrors<T extends FieldValues = FieldValues>(
  setError: UseFormSetError<T>,
) {
  const handleFormErrors = useCallback(
    ({ shouldFocus = true, ...item }: FormErrors<T>) => {
      if ('errors' in item) {
        item.errors.forEach(({ attribute, type, full_message }) => {
          setError(attribute, { type, message: full_message }, { shouldFocus })
        })
      } else {
        const { attribute, type, full_message } = item.error
        setError(attribute, { type, message: full_message }, { shouldFocus })
      }
    },
    [setError],
  )

  return { handleFormErrors }
}
