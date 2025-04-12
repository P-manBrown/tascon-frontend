'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-text'
import { useEditableMultiLineText } from '@/components/editable-text/use-editable-multi-line-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextArea } from '@/components/form-controls/text-area'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { countCharacters } from '@/utils/string-count/count-characters'
import { changeBio } from './change-bio.api'

const bioSchema = z.object({
  bio: z
    .string()
    .trim()
    .refine((value) => countCharacters(value) <= 250, {
      message: '最大文字数を超えています。',
    }),
})

type ChangeBioFormValue = z.infer<typeof bioSchema>

type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  initialBio: string | undefined
  label: React.ReactElement
  privacyTag: React.ReactElement
  unsavedChangeTag: React.ReactElement
}

export function BioEditor({
  currentUserId,
  initialBio = '',
  label,
  privacyTag,
  unsavedChangeTag,
  children,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const {
    isEditorOpen,
    updateField,
    isSubmitting,
    hasLocalStorageValue,
    handleFormSubmit,
    handleBlur,
    handleCancelClick,
    registerReturn,
    fieldError,
    setFieldError,
    closeEditor,
    saveFieldValueToLocalStorage,
    ...rest
  } = useEditableText<ChangeBioFormValue>({
    editorRef,
    currentUserId,
    defaultValue: initialBio,
    schema: bioSchema,
    name: 'bio',
    shouldSaveToLocalStorage: true,
  })
  const { shadowRef, wordCount, handleInput } = useEditableMultiLineText({
    editorRef,
    isEditorOpen,
  })
  const { openErrorSnackbar } = useErrorSnackbar()

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 404) {
      saveFieldValueToLocalStorage()
      router.replace(redirectLoginPath)
    } else if (err.statusCode === 422) {
      if (err.message.startsWith('自己紹介')) {
        setFieldError({
          type: err.statusCode.toString(),
          message: err.message,
        })
      } else {
        openErrorSnackbar(err)
      }
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit = async (data: ChangeBioFormValue) => {
    const result = await changeBio(data)
    if (result.status === 'error') {
      if (result.name === 'HttpError') {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
      updateField(result.account.bio ?? '')
      closeEditor()
    }
  }

  return (
    <div>
      <DetailItemHeadingLayout>
        {label}
        {privacyTag}
        {hasLocalStorageValue && unsavedChangeTag}
      </DetailItemHeadingLayout>
      <EditableText
        editor={
          <TextArea
            ref={editorRef}
            shadowRef={shadowRef}
            rows={6}
            readOnly={isSubmitting}
            wordCount={wordCount}
            maxCount={250}
            register={registerReturn}
            errors={fieldError}
            onInput={handleInput}
          />
        }
        isEditorOpen={isEditorOpen}
        isSubmitting={isSubmitting}
        hasLocalStorageValue={hasLocalStorageValue}
        onFormSubmit={handleFormSubmit(onSubmit)}
        onCancelClick={handleCancelClick}
        onBlur={handleBlur(onSubmit)}
        {...rest}
      >
        {children}
      </EditableText>
    </div>
  )
}
