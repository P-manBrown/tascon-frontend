import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHandleFormErrors } from '@/utils/form/use-handle-form-error'
import { useLocalStorage } from '@/utils/local-storage/use-local-storage'
import type {
  BlurHandler,
  FormSubmitHandler,
  UseEditableDateTimeParams,
} from './use-editable-date-time.types'
import type { FieldValues } from 'react-hook-form'

export function useEditableDateTime<T extends FieldValues>({
  editorRef,
  currentUserId,
  dateFieldName,
  timeFieldName,
  schema,
  defaultDate,
  defaultTime,
  shouldSaveToLocalStorage,
}: UseEditableDateTimeParams) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const isPageHidden = useRef(false)
  const pathname = usePathname()
  const localStorageKey = `${currentUserId}_${pathname}_${dateFieldName}_${timeFieldName}`
  const {
    register,
    handleSubmit,
    resetField,
    getValues,
    setValue,
    setError,
    getFieldState,
    formState: { dirtyFields, isValid, isSubmitting },
  } = useForm({
    mode: 'onChange',
    shouldFocusError: false,
    shouldUseNativeValidation: false,
    resolver: zodResolver(schema),
    defaultValues: {
      [dateFieldName]: defaultDate ?? '',
      [timeFieldName]: defaultTime ?? '',
    },
  })
  const { handleFormErrors } = useHandleFormErrors(setError)
  const isDirty = Object.keys(dirtyFields).length > 0
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

  const updateFields = useCallback(
    (dateValue: string, timeValue: string) => {
      resetField(dateFieldName, { defaultValue: dateValue })
      resetField(timeFieldName, { defaultValue: timeValue })
      removeLocalStorageValue()
    },
    [resetField, dateFieldName, timeFieldName, removeLocalStorageValue],
  )

  const setFieldValuesFromLocalStorage = useCallback(() => {
    const localStorageValue = getLocalStorageValue()
    if (localStorageValue !== null) {
      const parsedValue: { date: string; time: string } =
        JSON.parse(localStorageValue)
      setValue(dateFieldName, parsedValue.date, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue(timeFieldName, parsedValue.time, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, [dateFieldName, timeFieldName, setValue, getLocalStorageValue])

  const saveFieldValuesToLocalStorage = useCallback(() => {
    if (isDirty) {
      const dateValue = getValues(dateFieldName)
      const timeValue = getValues(timeFieldName)
      const combinedValue = JSON.stringify({
        date: dateValue,
        time: timeValue,
      })
      saveToLocalStorage(combinedValue)
    }
  }, [isDirty, getValues, dateFieldName, timeFieldName, saveToLocalStorage])

  const handleFormSubmit: FormSubmitHandler<T> = useCallback(
    (onSubmit) => async (ev: React.SyntheticEvent) => {
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
    (onSubmit) => async (ev: React.FocusEvent<HTMLFormElement>) => {
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
    resetField(dateFieldName)
    resetField(timeFieldName)
    removeLocalStorageValue()
    setIsEditorOpen(false)
  }, [resetField, dateFieldName, timeFieldName, removeLocalStorageValue])

  const handlePageHide = useCallback(() => {
    isPageHidden.current = true
    saveFieldValuesToLocalStorage()
  }, [saveFieldValuesToLocalStorage])

  useEffect(() => {
    if (isEditorOpen && editorRef.current) {
      editorRef.current.focus({ preventScroll: true })
    }
  }, [isEditorOpen, editorRef])

  useEffect(() => {
    setFieldValuesFromLocalStorage()
  }, [setFieldValuesFromLocalStorage])

  useEffect(() => {
    if (shouldSaveToLocalStorage) {
      window.addEventListener('pagehide', handlePageHide)
      window.addEventListener('popstate', saveFieldValuesToLocalStorage)

      return () => {
        window.removeEventListener('pagehide', handlePageHide)
        window.removeEventListener('popstate', saveFieldValuesToLocalStorage)
      }
    }
  }, [saveFieldValuesToLocalStorage, shouldSaveToLocalStorage, handlePageHide])

  return {
    isEditorOpen,
    hasLocalStorageValue,
    isSubmitting,
    dateRegisterReturn: register(dateFieldName),
    timeRegisterReturn: register(timeFieldName),
    dateFieldError: getFieldState(dateFieldName).error,
    timeFieldError: getFieldState(timeFieldName).error,
    closeEditor,
    openEditor,
    handleFormErrors,
    updateFields,
    handleFormSubmit,
    handleBlur,
    handleCancelClick,
    saveFieldValuesToLocalStorage,
    removeLocalStorageValue,
  }
}
