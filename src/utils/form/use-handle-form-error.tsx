import { useCallback } from 'react'
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

type FormErrorItem<T extends FieldValues = FieldValues> = {
  source: FieldPath<T>
  type: string
  message: string
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
        item.errors.forEach(({ source, type, message }) => {
          setError(source, { type, message }, { shouldFocus })
        })
      } else {
        const { source, type, message } = item.error
        setError(source, { type, message }, { shouldFocus })
      }
    },
    [setError],
  )

  return { handleFormErrors }
}
