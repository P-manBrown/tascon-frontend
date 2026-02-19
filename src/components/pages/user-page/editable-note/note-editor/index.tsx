'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-fields/editable-text'
import { useEditableMultiLineText } from '@/components/editable-fields/editable-text/use-editable-multi-line-text'
import { useEditableText } from '@/components/editable-fields/editable-text/use-editable-text'
import { TextArea } from '@/components/form-controls/text-area'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { countCharacters } from '@/utils/string-count/count-characters'
import { changeNote } from './change-note.api'

type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  contactId: string
  initialNote: string | undefined
  label: React.ReactElement
  unsavedChangeTag: React.ReactElement
}

const noteSchema = z.object({
  note: z
    .string()
    .trim()
    .refine((value) => countCharacters(value) <= 1000, {
      error: '最大文字数を超えています。',
    }),
})

type ChangeNoteFormValue = z.infer<typeof noteSchema>

export function NoteEditor({
  currentUserId,
  contactId,
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
  } = useEditableText<ChangeNoteFormValue>({
    editorRef,
    currentUserId,
    defaultValue: initialNote,
    schema: noteSchema,
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

  const onSubmit = (data: ChangeNoteFormValue) => {
    startTransition(async () => {
      const result = await changeNote({ contactId, bodyData: data })
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        updateField(result.contact.note ?? '')
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
            placeholder="メモを入力してください"
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
