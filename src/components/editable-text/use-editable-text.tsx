import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useHandleFormErrors } from '@/utils/form/use-handle-form-error'
import { useLocalStorage } from '@/utils/local-storage/use-local-storage'
import type {
  UseEditableTextParams,
  FormSubmitHandler,
  BlurHandler,
} from './use-editable-text.types'
import type { FieldValues, SubmitHandler } from 'react-hook-form'

export function useEditableText<T extends FieldValues>({
  editorRef,
  currentUserId,
  name,
  schema,
  defaultValue,
  shouldSaveToLocalStorage,
}: UseEditableTextParams) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const isPageHidden = useRef(false)
  const pathname = usePathname()
  const localStorageKey = `${currentUserId}_${pathname}_${name}`
  const {
    register,
    handleSubmit,
    resetField,
    getValues,
    setValue,
    setError,
    formState: { isDirty, isValid, isSubmitting, errors },
  } = useForm({
    mode: 'onChange',
    shouldFocusError: false,
    shouldUseNativeValidation: false,
    resolver: zodResolver(schema),
    defaultValues: {
      [name]: defaultValue,
    },
  })
  const { handleFormErrors } = useHandleFormErrors(setError)
  const {
    hasLocalStorageValue,
    saveToLocalStorage,
    getLocalStorageValue,
    removeLocalStorageValue,
  } = useLocalStorage({ key: localStorageKey })

  const openEditor = useCallback(() => {
    setIsEditorOpen(true)
  }, [])

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false)
  }, [])

  const updateField = useCallback(
    (value: string) => {
      resetField(name, { defaultValue: value })
      removeLocalStorageValue()
    },
    [resetField, name, removeLocalStorageValue],
  )

  const setFieldValueFromLocalStorage = useCallback(() => {
    const localStorageValue = getLocalStorageValue()
    if (localStorageValue !== null) {
      setValue(name, localStorageValue, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, [name, setValue, getLocalStorageValue])

  const saveFieldValueToLocalStorage = useCallback(() => {
    if (isDirty) {
      const fieldValue = getValues(name)
      saveToLocalStorage(fieldValue)
    }
  }, [getValues, name, saveToLocalStorage, isDirty])

  const handleFormSubmit: FormSubmitHandler<T> = useCallback(
    (onSubmit: SubmitHandler<any>) => async (ev: React.SyntheticEvent) => {
      ev.preventDefault()
      if (isDirty) {
        await handleSubmit(onSubmit)()
      } else {
        removeLocalStorageValue()
      }
      if (isValid) {
        setIsEditorOpen(false)
      }
    },
    [isDirty, handleSubmit, removeLocalStorageValue, isValid],
  )

  const handleBlur: BlurHandler<T> = useCallback(
    (onSubmit: SubmitHandler<any>) =>
      async (ev: React.FocusEvent<HTMLFormElement>) => {
        // Prevent form submission when the browser tab is closed
        if (isPageHidden.current) {
          return
        }

        const isFocusWithin = ev.currentTarget.contains(ev.relatedTarget)
        if (!isFocusWithin) {
          if (isDirty) {
            await handleSubmit(onSubmit)()
          } else {
            removeLocalStorageValue()
          }
          if (isValid) {
            setIsEditorOpen(false)
          }
        }
      },
    [isDirty, handleSubmit, removeLocalStorageValue, isValid],
  )

  const handleCancelClick = useCallback(() => {
    resetField(name)
    removeLocalStorageValue()
    setIsEditorOpen(false)
  }, [resetField, name, removeLocalStorageValue])

  const handlePageHide = useCallback(() => {
    isPageHidden.current = true
    saveFieldValueToLocalStorage()
  }, [saveFieldValueToLocalStorage])

  useEffect(() => {
    if (isEditorOpen && editorRef.current) {
      editorRef.current.focus({ preventScroll: true })
    }
  }, [isEditorOpen, editorRef])

  useEffect(() => {
    setFieldValueFromLocalStorage()
  }, [setFieldValueFromLocalStorage])

  useEffect(() => {
    if (shouldSaveToLocalStorage) {
      window.addEventListener('pagehide', handlePageHide)
      window.addEventListener('popstate', saveFieldValueToLocalStorage)

      return () => {
        window.removeEventListener('pagehide', handlePageHide)
        window.removeEventListener('popstate', saveFieldValueToLocalStorage)
      }
    }
  }, [saveFieldValueToLocalStorage, shouldSaveToLocalStorage, handlePageHide])

  return {
    isEditorOpen,
    hasLocalStorageValue,
    isSubmitting,
    registerReturn: register(name),
    fieldError: errors[name],
    closeEditor,
    openEditor,
    handleFormErrors,
    updateField,
    handleFormSubmit,
    handleBlur,
    handleCancelClick,
    saveFieldValueToLocalStorage,
  }
}
