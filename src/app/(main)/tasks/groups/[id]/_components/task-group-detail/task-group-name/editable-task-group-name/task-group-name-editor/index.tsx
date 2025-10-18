'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextField } from '@/components/form-controls/text-field'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { taskGroupSchema } from '@/schemas/request/task-group'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeTaskGroupName } from './change-task-group-name.api'

type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  taskGroupId: string
  initialName: string
  label: React.ReactElement
  unsavedChangeTag: React.ReactElement
}

const taskGroupNameSchema = taskGroupSchema.pick({ name: true })

type UpdateTaskGroupNameFormValue = z.infer<typeof taskGroupNameSchema>

export function TaskGroupNameEditor({
  currentUserId,
  taskGroupId,
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
  } = useEditableText<UpdateTaskGroupNameFormValue>({
    editorRef,
    currentUserId,
    defaultValue: initialName,
    schema: taskGroupNameSchema,
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

  const onSubmit = (data: UpdateTaskGroupNameFormValue) => {
    startTransition(async () => {
      const result = await changeTaskGroupName({ taskGroupId, bodyData: data })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        updateField(result.taskGroup.name)
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
