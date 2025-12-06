import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { Button } from '@/components/buttons/button'
import { useTextArea } from '@/components/form-controls/text-area/use-text-area'
import { createTask } from '@/components/pages/create-task-page/create-task-form/create-task.api'
import { useLocalStorage } from '@/utils/local-storage/use-local-storage'
import { createTaskSchema } from './create-task.schema'
import type { SubmitHandler } from 'react-hook-form'

type CreateTaskFormInput = z.input<typeof createTaskSchema>
type CreateTaskFormOutput = z.output<typeof createTaskSchema>

type Params = {
  currentUserId: string
  defaultTaskGroupId?: number
}

export function useCreateTaskForm({
  currentUserId,
  defaultTaskGroupId,
}: Params) {
  const noteEditorRef = useRef<HTMLTextAreaElement>(null)
  const id = useId()
  const [isPending, startTransition] = useTransition()
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { openErrorSnackbar } = useErrorSnackbar()
  const isPageHidden = useRef(false)
  const pathname = usePathname()
  const localStorageKey = `${currentUserId}_${pathname}_create-task-form`
  const { saveToLocalStorage, getLocalStorageValue, removeLocalStorageValue } =
    useLocalStorage({ key: localStorageKey })

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<CreateTaskFormInput, unknown, CreateTaskFormOutput>({
    mode: 'onBlur',
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      taskGroupId: defaultTaskGroupId,
      name: '',
      duration: {
        startsAt: {
          startsAtDate: '',
          startsAtTime: '',
        },
        endsAt: {
          endsAtDate: '',
          endsAtTime: '',
        },
      },
      estimatedTime: {
        estimatedHours: undefined,
        estimatedMinutes: undefined,
      },
      note: '',
    },
  })

  const { shadowRef, wordCount, adjustHeight, updateWordCount } = useTextArea({
    countGranularity: 'character',
  })

  const handleNoteInput = useCallback(
    (ev: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight(ev.currentTarget)
      updateWordCount(ev.currentTarget.value)
    },
    [adjustHeight, updateWordCount],
  )

  const setFormValuesFromLocalStorage = useCallback(() => {
    const localStorageValue = getLocalStorageValue()
    if (localStorageValue !== null) {
      const parsedValue: CreateTaskFormInput = JSON.parse(localStorageValue)

      if (parsedValue.taskGroupId !== undefined) {
        setValue('taskGroupId', parsedValue.taskGroupId, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
      if (parsedValue.name !== undefined) {
        setValue('name', parsedValue.name, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
      if (parsedValue.duration?.startsAt?.startsAtDate !== undefined) {
        setValue(
          'duration.startsAt.startsAtDate',
          parsedValue.duration.startsAt.startsAtDate,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        )
      }
      if (parsedValue.duration?.startsAt?.startsAtTime !== undefined) {
        setValue(
          'duration.startsAt.startsAtTime',
          parsedValue.duration.startsAt.startsAtTime,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        )
      }
      if (parsedValue.duration?.endsAt?.endsAtDate !== undefined) {
        setValue(
          'duration.endsAt.endsAtDate',
          parsedValue.duration.endsAt.endsAtDate,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        )
      }
      if (parsedValue.duration?.endsAt?.endsAtTime !== undefined) {
        setValue(
          'duration.endsAt.endsAtTime',
          parsedValue.duration.endsAt.endsAtTime,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        )
      }
      if (parsedValue.estimatedTime?.estimatedHours !== undefined) {
        setValue(
          'estimatedTime.estimatedHours',
          parsedValue.estimatedTime.estimatedHours,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        )
      }
      if (parsedValue.estimatedTime?.estimatedMinutes !== undefined) {
        setValue(
          'estimatedTime.estimatedMinutes',
          parsedValue.estimatedTime.estimatedMinutes,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        )
      }
      if (parsedValue.note !== undefined) {
        setValue('note', parsedValue.note, {
          shouldValidate: true,
          shouldDirty: true,
        })
        if (noteEditorRef.current) {
          adjustHeight(noteEditorRef.current)
          updateWordCount(parsedValue.note)
        }
      }

      const handleClick = () => {
        reset()
        removeLocalStorageValue()
      }

      openSnackbar({
        severity: 'info',
        message: '前回の入力内容を復元しました。',
        actionButton: (
          <Button
            onClick={handleClick}
            className="btn-ghost h-fit p-1 text-sm text-red-500 hover:bg-white/20"
          >
            リセット
          </Button>
        ),
      })
    }
  }, [
    getLocalStorageValue,
    setValue,
    adjustHeight,
    updateWordCount,
    openSnackbar,
    reset,
    removeLocalStorageValue,
  ])

  const saveFormValuesToLocalStorage = useCallback(() => {
    // See https://is.gd/qYTBEq
    const hasDirtyFields = Object.keys(dirtyFields).length > 0
    if (hasDirtyFields) {
      const formValues = getValues()
      saveToLocalStorage(JSON.stringify(formValues))
    }
  }, [getValues, saveToLocalStorage, dirtyFields])

  const handlePageHide = useCallback(() => {
    isPageHidden.current = true
    saveFormValuesToLocalStorage()
  }, [saveFormValuesToLocalStorage])

  const onSubmit: SubmitHandler<CreateTaskFormOutput> = useCallback(
    (data) => {
      startTransition(async () => {
        const result = await createTask({
          taskGroupId: data.taskGroupId,
          name: data.name,
          startsAt: data.duration.startsAt,
          endsAt: data.duration.endsAt,
          estimatedMinutes: data.estimatedTime,
          note: data.note,
        })
        if (result.status === 'error') {
          openErrorSnackbar(result)
        } else {
          removeLocalStorageValue()
          reset()
          if (noteEditorRef.current) {
            adjustHeight(noteEditorRef.current)
            updateWordCount(noteEditorRef.current.value)
          }
        }
      })
    },
    [
      reset,
      openErrorSnackbar,
      adjustHeight,
      updateWordCount,
      removeLocalStorageValue,
    ],
  )

  useEffect(() => {
    setFormValuesFromLocalStorage()
  }, [setFormValuesFromLocalStorage])

  useEffect(() => {
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('popstate', saveFormValuesToLocalStorage)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('popstate', saveFormValuesToLocalStorage)
    }
  }, [saveFormValuesToLocalStorage, handlePageHide])

  return {
    id,
    register,
    handleSubmit,
    errors,
    onSubmit,
    isPending,
    noteEditorRef,
    shadowRef,
    wordCount,
    handleNoteInput,
  }
}
