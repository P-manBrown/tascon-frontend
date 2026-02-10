'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-fields/editable-text'
import { useEditableText } from '@/components/editable-fields/editable-text/use-editable-text'
import { TextField } from '@/components/form-controls/text-field'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { countCharacters } from '@/utils/string-count/count-characters'
import { changeTaskName } from './change-task-name.api'

type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  taskId: string
  initialName: string
  label: React.ReactElement
  unsavedChangeTag: React.ReactElement
}

const taskNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'タスク名を入力してください。')
    .refine((value) => countCharacters(value) <= 255, {
      message: '255文字以下で入力してください。',
    }),
})

type TaskNameFormValue = z.infer<typeof taskNameSchema>

export function TaskNameEditor({
  currentUserId,
  taskId,
  initialName,
  label,
  unsavedChangeTag,
  children,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const editorRef = useRef<HTMLInputElement>(null)

  const {
    updateField,
    isEditorOpen,
    hasLocalStorageValue,
    handleFormSubmit,
    handleCancelClick,
    handleBlur,
    registerReturn,
    fieldError,
    saveFieldValueToLocalStorage,
    openEditor,
  } = useEditableText<TaskNameFormValue>({
    editorRef,
    currentUserId,
    defaultValue: initialName,
    schema: taskNameSchema,
    name: 'name',
    shouldSaveToLocalStorage: true,
  })

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 401) {
      saveFieldValueToLocalStorage()
      router.push(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit = (data: TaskNameFormValue) => {
    startTransition(async () => {
      const result = await changeTaskName({ taskId, bodyData: data })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        updateField(result.task.name)

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
      <EditableText
        editor={
          <TextField
            ref={editorRef}
            type="text"
            readOnly={isPending}
            register={registerReturn}
            errors={fieldError}
          />
        }
        onFormSubmit={handleFormSubmit(onSubmit)}
        onCancelClick={handleCancelClick}
        onBlur={handleBlur(onSubmit)}
        isSubmitting={isPending}
        hasLocalStorageValue={hasLocalStorageValue}
        isEditorOpen={isEditorOpen || isPending}
        openEditor={openEditor}
      >
        {children}
      </EditableText>
    </div>
  )
}
