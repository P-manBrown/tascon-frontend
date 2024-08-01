import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { generateLocalStorageKey } from '@/utils/local-storage/generate-local-storage-key'
import { useLocalStorage } from '@/utils/local-storage/use-local-storage'
import type {
  UseEditableTextParams,
  FormSubmitHandler,
  BlurHandler,
} from './use-editable-text.types'
import type { FieldError, FieldValues, SubmitHandler } from 'react-hook-form'

export function useEditableText<T extends FieldValues>({
  editorRef,
  currentUserId,
  name,
  schema,
  defaultValue,
  shouldSaveToLocalStorage,
}: UseEditableTextParams) {
  const pathname = usePathname()
  const fieldId = `${pathname}_${name}`
  const localStorageKey = generateLocalStorageKey(currentUserId, fieldId)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [fieldValue, setFieldValue] = useState(defaultValue)
  const {
    register,
    handleSubmit,
    resetField,
    getValues,
    setValue,
    setError,
    formState: { isDirty, isSubmitting, errors },
  } = useForm({
    mode: 'onChange',
    shouldFocusError: false,
    shouldUseNativeValidation: false,
    resolver: zodResolver(schema),
    defaultValues: {
      [name]: defaultValue,
    },
  })
  const {
    hasLocalStorageValue,
    saveToLocalStorage,
    getLocalStorageValue,
    removeLocalStorageValue,
  } = useLocalStorage()
  const registerReturn = register(name)
  const fieldError = errors[name]

  const openEditor = useCallback(() => {
    setIsEditorOpen(true)
  }, [])

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false)
  }, [])

  const setFieldError = useCallback(
    (error: FieldError) => {
      setError(name, error)
    },
    [setError, name]
  )

  const updateField = useCallback(
    (value: string) => {
      resetField(name, { defaultValue: value })
      setFieldValue(value)
      removeLocalStorageValue(localStorageKey)
    },
    [resetField, name, removeLocalStorageValue, localStorageKey]
  )

  const setFieldValueFromLocalStorage = useCallback(() => {
    const localStorageValue = getLocalStorageValue(localStorageKey)
    if (localStorageValue !== null) {
      setValue(name, localStorageValue, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setFieldValue(localStorageValue)
    }
  }, [name, setValue, setFieldValue, getLocalStorageValue, localStorageKey])

  const saveFieldValueToLocalStorage = useCallback(() => {
    if (isDirty) {
      const fieldValue = getValues(name)
      saveToLocalStorage(localStorageKey, fieldValue)
    }
  }, [getValues, name, saveToLocalStorage, localStorageKey, isDirty])

  const handleFormSubmit: FormSubmitHandler<T> = useCallback(
    (onSubmit: SubmitHandler<any>) => async (ev: React.SyntheticEvent) => {
      ev.preventDefault()
      if (isDirty) {
        await handleSubmit(onSubmit)()
      } else {
        removeLocalStorageValue(localStorageKey)
        setIsEditorOpen(false)
      }
    },
    [isDirty, handleSubmit, removeLocalStorageValue, localStorageKey]
  )

  const handleBlur: BlurHandler<T> = useCallback(
    (onSubmit: SubmitHandler<any>) =>
      async (ev: React.FocusEvent<HTMLFormElement>) => {
        const isTargetInput = ev.target instanceof HTMLInputElement
        const isTargetTextArea = ev.target instanceof HTMLTextAreaElement
        const isFocusWithin = ev.currentTarget.contains(ev.relatedTarget)
        if ((isTargetInput || isTargetTextArea) && !isFocusWithin) {
          if (isDirty) {
            await handleSubmit(onSubmit)()
          } else {
            removeLocalStorageValue(localStorageKey)
            setIsEditorOpen(false)
          }
        }
      },
    [isDirty, handleSubmit, removeLocalStorageValue, localStorageKey]
  )

  const handleCancelClick = useCallback(() => {
    resetField(name)
    setIsEditorOpen(false)
    setFieldValue(defaultValue)
    removeLocalStorageValue(localStorageKey)
  }, [resetField, name, defaultValue, removeLocalStorageValue, localStorageKey])

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
      window.addEventListener('pagehide', saveFieldValueToLocalStorage)
      window.addEventListener('popstate', saveFieldValueToLocalStorage)

      return () => {
        window.removeEventListener('pagehide', saveFieldValueToLocalStorage)
        window.removeEventListener('popstate', saveFieldValueToLocalStorage)
      }
    }
  }, [saveFieldValueToLocalStorage, shouldSaveToLocalStorage])

  return {
    isEditorOpen,
    hasLocalStorageValue,
    fieldValue,
    isSubmitting,
    registerReturn,
    fieldError,
    closeEditor,
    openEditor,
    setFieldError,
    updateField,
    handleFormSubmit,
    handleBlur,
    handleCancelClick,
    saveFieldValueToLocalStorage,
  }
}
