'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableHoursMinutes } from '@/components/editable-fields/editable-hours-minutes'
import { useEditableHoursMinutes } from '@/components/editable-fields/editable-hours-minutes/use-editable-hours-minutes'
import { HoursMinutesInput } from '@/components/form-controls/hours-minutes-input'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeTaskEstimatedTime } from './change-task-estimated-time.api'

type Props = {
  currentUserId: string
  taskId: string
  initialEstimatedMinutes?: number
  label: React.ReactElement
  unsavedChangeTag: React.ReactElement
  children: React.ReactElement
}

const taskEstimatedTimeSchema = z.object({
  estimatedHours: z.coerce
    .number()
    .int('時間には整数を入力してください。')
    .gte(0, '時間には0以上の数値を入力してください。'),
  estimatedMinutes: z.coerce
    .number()
    .int('分には整数を入力してください。')
    .gte(0, '分には0以上の数値を入力してください。')
    .lte(59, '分には59以下の数値を入力してください。'),
})

type TaskEstimatedTimeFormValue = z.infer<typeof taskEstimatedTimeSchema>

function minutesToHoursAndMinutes(totalMinutes: number | undefined) {
  if (totalMinutes === undefined) {
    return { hours: 0, minutes: 0 }
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return { hours, minutes }
}

export function TaskEstimatedTimeEditor({
  currentUserId,
  taskId,
  initialEstimatedMinutes,
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

  const { hours, minutes } = minutesToHoursAndMinutes(initialEstimatedMinutes)

  const defaultValue = {
    estimatedHours: hours || undefined,
    estimatedMinutes: minutes || undefined,
  }

  const {
    updateFields,
    isEditorOpen,
    hasLocalStorageValue,
    handleFormSubmit,
    handleCancelClick,
    handleBlur,
    hoursRegister,
    minutesRegister,
    hoursError,
    minutesError,
    saveFieldValuesToLocalStorage,
    removeLocalStorageValue,
    openEditor,
    closeEditor,
  } = useEditableHoursMinutes<TaskEstimatedTimeFormValue>({
    editorRef,
    currentUserId,
    defaultHours: defaultValue.estimatedHours,
    defaultMinutes: defaultValue.estimatedMinutes,
    schema: taskEstimatedTimeSchema,
    hoursFieldName: 'estimatedHours',
    minutesFieldName: 'estimatedMinutes',
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

  const onSubmit = (data: TaskEstimatedTimeFormValue) => {
    startSubmitTransition(async () => {
      const totalMinutes =
        (data.estimatedHours ?? 0) * 60 + (data.estimatedMinutes ?? 0)
      const estimatedMinutes = totalMinutes !== 0 ? totalMinutes : null

      const result = await changeTaskEstimatedTime({
        taskId,
        bodyData: { estimatedMinutes },
      })

      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        const { hours: newHours, minutes: newMinutes } =
          minutesToHoursAndMinutes(result.task.estimatedMinutes)
        updateFields(newHours ?? 0, newMinutes ?? 0)
      }
    })
  }

  const handleDeleteClick = () => {
    startDeleteTransition(async () => {
      const result = await changeTaskEstimatedTime({
        taskId,
        bodyData: { estimatedMinutes: null },
      })

      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        updateFields(0, 0)
        removeLocalStorageValue()
        closeEditor()
      }
    })
  }

  return (
    <div>
      <DetailItemHeadingLayout>
        {label}
        {hasLocalStorageValue && unsavedChangeTag}
      </DetailItemHeadingLayout>
      <EditableHoursMinutes
        editor={
          <HoursMinutesInput
            hoursId="estimatedHours"
            minutesId="estimatedMinutes"
            hoursLabel="見積もりの時間"
            minutesLabel="見積もりの分"
            hoursRegister={hoursRegister}
            minutesRegister={minutesRegister}
            hoursError={hoursError}
            minutesError={minutesError}
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
        showDeleteButton={initialEstimatedMinutes !== undefined}
        hasLocalStorageValue={hasLocalStorageValue}
        isEditorOpen={isEditorOpen || isPending}
        openEditor={openEditor}
      >
        {children}
      </EditableHoursMinutes>
    </div>
  )
}
