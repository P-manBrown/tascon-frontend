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
import { changeTaskEndsAt } from './change-task-ends-at.api'

type Props = Pick<React.ComponentProps<typeof EditableDateTime>, 'children'> & {
  currentUserId: string
  taskId: string
  initialEndsAt: string | undefined
  startsAt: string | undefined
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

function createTaskEndsAtSchema(startsAt: string | undefined) {
  return z
    .object({
      endsAt: z
        .object({
          endsAtDate: z.string().min(1, '期日を入力してください。'),
          endsAtTime: z.string().optional(),
        })
        .transform((value) => {
          if (value.endsAtDate === undefined || value.endsAtDate === '') {
            return undefined
          }

          const timeValue =
            value.endsAtTime !== undefined && value.endsAtTime !== ''
              ? `${value.endsAtTime}:59`
              : '23:59:59'
          return `${value.endsAtDate}T${timeValue}`
        }),
    })
    .refine(
      (data) => {
        return validateEndDateAfterStartDate(startsAt, data.endsAt)
      },
      {
        path: ['endsAt.endsAtDate'],
        error: '開始日以降の日時を入力してください。',
      },
    )
}

type TaskEndsAtFormValue = z.infer<ReturnType<typeof createTaskEndsAtSchema>>

export function TaskEndsAtEditor({
  currentUserId,
  taskId,
  initialEndsAt,
  startsAt,
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
  const endsAtParsed =
    initialEndsAt === undefined ? undefined : parseDateTime(initialEndsAt)
  const taskEndsAtSchema = createTaskEndsAtSchema(startsAt)

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
  } = useEditableDateTime<TaskEndsAtFormValue>({
    editorRef,
    currentUserId,
    dateFieldName: 'endsAt.endsAtDate',
    timeFieldName: 'endsAt.endsAtTime',
    defaultDate: endsAtParsed?.date,
    defaultTime: endsAtParsed?.time,
    schema: taskEndsAtSchema,
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

  const onSubmit = (data: TaskEndsAtFormValue) => {
    startSubmitTransition(async () => {
      const result = await changeTaskEndsAt({
        taskId,
        bodyData: { endsAt: data.endsAt },
      })

      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        const endsAt = result.task.endsAt
        const updatedEndsAt =
          endsAt === undefined ? undefined : parseDateTime(endsAt)
        updateFields(updatedEndsAt?.date ?? '', updatedEndsAt?.time ?? '')

        // Notify calendar to refresh task events after update
        window.dispatchEvent(new CustomEvent('task-updated'))
      }
    })
  }

  const handleDeleteClick = () => {
    startDeleteTransition(async () => {
      const result = await changeTaskEndsAt({
        taskId,
        bodyData: { endsAt: null },
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
            dateId="endsAtDate"
            timeId="endsAtTime"
            dateLabel="期日の日付"
            timeLabel="期日の時間"
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
        showDeleteButton={initialEndsAt !== undefined}
        hasLocalStorageValue={hasLocalStorageValue}
        isEditorOpen={isEditorOpen || isPending}
        openEditor={openEditor}
      >
        {children}
      </EditableDateTime>
    </div>
  )
}
