'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-text'
import { useEditableMultiLineText } from '@/components/editable-text/use-editable-multi-line-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextArea } from '@/components/form-controls/text-area'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { taskGroupSchema } from '@/schemas/request/task-group'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeTaskGroupNote } from './change-task-group-note.api'

type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  taskGroupId: string
  initialNote: string | undefined
  label: React.ReactElement
  unsavedChangeTag: React.ReactElement
}

const taskGroupNoteSchema = taskGroupSchema.pick({ note: true })

type UpdateTaskGroupNoteFormValue = z.infer<typeof taskGroupNoteSchema>

export function TaskGroupNoteEditor({
  currentUserId,
  taskGroupId,
  initialNote = '',
  label,
  unsavedChangeTag,
  children,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const editorRef = useRef<HTMLTextAreaElement>(null)

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
  } = useEditableText<UpdateTaskGroupNoteFormValue>({
    editorRef,
    currentUserId,
    defaultValue: initialNote,
    schema: taskGroupNoteSchema,
    name: 'note',
    shouldSaveToLocalStorage: true,
  })

  const { shadowRef, wordCount, handleInput } = useEditableMultiLineText({
    editorRef,
    isEditorOpen,
  })

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 401) {
      saveFieldValueToLocalStorage()
      router.push(redirectLoginPath)
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit = (data: UpdateTaskGroupNoteFormValue) => {
    startTransition(async () => {
      const result = await changeTaskGroupNote({ taskGroupId, bodyData: data })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        updateField(result.taskGroup.note ?? '')
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
          <TextArea
            ref={editorRef}
            shadowRef={shadowRef}
            rows={6}
            readOnly={isPending}
            wordCount={wordCount}
            maxCount={1000}
            register={registerReturn}
            errors={fieldError}
            onInput={handleInput}
          />
        }
        isEditorOpen={isEditorOpen || isPending}
        isSubmitting={isPending}
        hasLocalStorageValue={hasLocalStorageValue}
        onFormSubmit={handleFormSubmit(onSubmit)}
        onCancelClick={handleCancelClick}
        onBlur={handleBlur(onSubmit)}
        openEditor={openEditor}
      >
        {children}
      </EditableText>
    </div>
  )
}
