import { useCallback } from 'react'
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'

type FormErrors<T extends FieldValues = FieldValues> = {
  errors: Array<{
    attribute: FieldPath<T>
    type: string
    full_message: string
  }>
  shouldFocus?: boolean
}

export function useHandleFormErrors<T extends FieldValues = FieldValues>(
  setError: UseFormSetError<T>,
) {
  const handleFormErrors = useCallback(
    ({ errors, shouldFocus = true }: FormErrors<T>) => {
      errors.forEach(({ attribute, type, full_message }) => {
        setError(attribute, { type, message: full_message }, { shouldFocus })
      })
    },
    [setError],
  )

  return { handleFormErrors }
}
