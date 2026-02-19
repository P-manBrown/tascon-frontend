import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useHandleFormErrors } from '@/utils/form/use-handle-form-error'
import { useLocalStorage } from '@/utils/local-storage/use-local-storage'
import type {
  UseEditableHoursMinutesParams,
  FormSubmitHandler,
  BlurHandler,
} from './use-editable-hours-minutes.types'
import type { FieldValues } from 'react-hook-form'

export function useEditableHoursMinutes<T extends FieldValues>({
  editorRef,
  currentUserId,
  hoursFieldName,
  minutesFieldName,
  schema,
  defaultHours,
  defaultMinutes,
  shouldSaveToLocalStorage,
}: UseEditableHoursMinutesParams<T>) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const isPageHidden = useRef(false)
  const pathname = usePathname()
  const localStorageKey = `${currentUserId}_${pathname}_${String(hoursFieldName)}_${String(minutesFieldName)}`
  const {
    register,
    handleSubmit,
    reset,
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
      [hoursFieldName]: defaultHours ?? 0,
      [minutesFieldName]: defaultMinutes ?? 0,
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
    (hoursValue: number, minutesValue: number) => {
      reset({
        [hoursFieldName]: hoursValue,
        [minutesFieldName]: minutesValue,
      })
      removeLocalStorageValue()
    },
    [reset, hoursFieldName, minutesFieldName, removeLocalStorageValue],
  )

  const setFieldValuesFromLocalStorage = useCallback(() => {
    const localStorageValue = getLocalStorageValue()
    if (localStorageValue !== null) {
      const parsedValue = JSON.parse(localStorageValue)
      setValue(hoursFieldName, parsedValue[hoursFieldName], {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue(minutesFieldName, parsedValue[minutesFieldName], {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, [hoursFieldName, minutesFieldName, setValue, getLocalStorageValue])

  const saveFieldValuesToLocalStorage = useCallback(() => {
    if (isDirty) {
      const hoursValue = getValues(hoursFieldName)
      const minutesValue = getValues(minutesFieldName)
      const combinedValue = JSON.stringify({
        [hoursFieldName]: hoursValue,
        [minutesFieldName]: minutesValue,
      })
      saveToLocalStorage(combinedValue)
    }
  }, [isDirty, getValues, hoursFieldName, minutesFieldName, saveToLocalStorage])

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
    reset()
    removeLocalStorageValue()
    setIsEditorOpen(false)
  }, [reset, removeLocalStorageValue])

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
    hoursRegister: register(hoursFieldName),
    minutesRegister: register(minutesFieldName),
    hoursError: getFieldState(hoursFieldName).error,
    minutesError: getFieldState(minutesFieldName).error,
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
