'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableDateTime } from '@/components/editable-fields/editable-date-time'
import { useEditableDateTime } from '@/components/editable-fields/editable-date-time/use-editable-date-time'
import { DateTimeInput } from '@/components/form-controls/date-time-input'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { validateEndDateAfterStartDate } from '@/components/pages/create-task-page/create-task-form/create-task.schema'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeTaskStartsAt } from './change-task-starts-at.api'

type Props = Pick<React.ComponentProps<typeof EditableDateTime>, 'children'> & {
  currentUserId: string
  taskId: string
  initialStartsAt: string | undefined
  endsAt: string | undefined
  label: React.ReactElement
  unsavedChangeTag: React.ReactElement
}

function parseDateTime(isoString: string) {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

function createTaskDurationSchema(endsAt: string | undefined) {
  return z
    .object({
      startsAt: z
        .object({
          startsAtDate: z.string().min(1, '開始日を入力してください。'),
          startsAtTime: z.string().optional(),
        })
        .transform((value) => {
          if (value.startsAtDate === undefined || value.startsAtDate === '') {
            return undefined
          }

          const timeValue =
            value.startsAtTime !== undefined && value.startsAtTime !== ''
              ? `${value.startsAtTime}:00`
              : '00:00:00'
          return `${value.startsAtDate}T${timeValue}`
        }),
    })
    .refine(
      (data) => {
        return validateEndDateAfterStartDate(data.startsAt, endsAt)
      },
      {
        path: ['startsAt.startsAtDate'],
        error: '期日以前の日時を入力してください。',
      },
    )
}

type TaskDurationFormValue = z.infer<
  ReturnType<typeof createTaskDurationSchema>
>

export function TaskStartsAtEditor({
  currentUserId,
  taskId,
  initialStartsAt,
  endsAt,
  label,
  unsavedChangeTag,
  children,
}: Props) {
  const [isSubmitting, startSubmitTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const isPending = isSubmitting || isDeleting
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const editorRef = useRef<HTMLInputElement>(null)
  const startsAtParsed =
    initialStartsAt === undefined ? undefined : parseDateTime(initialStartsAt)
  const taskDurationSchema = createTaskDurationSchema(endsAt)

  const {
    isEditorOpen,
    hasLocalStorageValue,
    handleFormSubmit,
    handleCancelClick,
    handleBlur,
    dateRegisterReturn,
    timeRegisterReturn,
    dateFieldError,
    timeFieldError,
    saveFieldValuesToLocalStorage,
    removeLocalStorageValue,
    updateFields,
    openEditor,
    closeEditor,
  } = useEditableDateTime<TaskDurationFormValue>({
    editorRef,
    currentUserId,
    dateFieldName: 'startsAt.startsAtDate',
    timeFieldName: 'startsAt.startsAtTime',
    defaultDate: startsAtParsed?.date,
    defaultTime: startsAtParsed?.time,
    schema: taskDurationSchema,
    shouldSaveToLocalStorage: true,
  })

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 401) {
      saveFieldValuesToLocalStorage()
      router.push(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit = (data: TaskDurationFormValue) => {
    startSubmitTransition(async () => {
      const result = await changeTaskStartsAt({
        taskId,
        bodyData: { startsAt: data.startsAt },
      })

      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        const startsAt = result.task.startsAt
        const updatedStartsAt =
          startsAt === undefined ? undefined : parseDateTime(startsAt)
        updateFields(updatedStartsAt?.date ?? '', updatedStartsAt?.time ?? '')

        // Notify calendar to refresh task events after update
        window.dispatchEvent(new CustomEvent('task-updated'))
      }
    })
  }

  const handleDeleteClick = () => {
    startDeleteTransition(async () => {
      const result = await changeTaskStartsAt({
        taskId,
        bodyData: { startsAt: null },
      })

      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        updateFields('', '')
        removeLocalStorageValue()
        closeEditor()

        // Notify calendar to refresh task events after update
        window.dispatchEvent(new CustomEvent('task-updated'))
      }
    })
  }

  return (
    <div>
      <DetailItemHeadingLayout>
        {label}
        {hasLocalStorageValue && unsavedChangeTag}
      </DetailItemHeadingLayout>
      <EditableDateTime
        editor={
          <DateTimeInput
            dateId="startsAtDate"
            timeId="startsAtTime"
            dateLabel="開始日の日付"
            timeLabel="開始日の時間"
            dateRegister={dateRegisterReturn}
            timeRegister={timeRegisterReturn}
            dateError={dateFieldError}
            timeError={timeFieldError}
            readOnly={isPending}
            ref={editorRef}
          />
        }
        onFormSubmit={handleFormSubmit(onSubmit)}
        onCancelClick={handleCancelClick}
        onDeleteClick={handleDeleteClick}
        onBlur={handleBlur(onSubmit)}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        showDeleteButton={initialStartsAt !== undefined}
        hasLocalStorageValue={hasLocalStorageValue}
        isEditorOpen={isEditorOpen || isPending}
        openEditor={openEditor}
      >
        {children}
      </EditableDateTime>
    </div>
  )
}
