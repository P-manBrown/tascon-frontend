'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { CollapsibleSection } from '@/components/collapsible-section'
import { EditableText } from '@/components/editable-text'
import { useEditableMultiLineText } from '@/components/editable-text/use-editable-multi-line-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextArea } from '@/components/form-controls/text-area'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { DetailMultiLineText } from '@/components/texts/detail-multi-line-text'
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

type Props = {
  currentUserId: string
  initialBio: string
  label: React.ReactElement
  privacyTag: React.ReactElement
  unsavedChangeTag: React.ReactElement
  height: React.ComponentProps<typeof CollapsibleSection>['height']
  csrfToken: string
}

export function EditableBio({
  currentUserId,
  initialBio,
  label,
  privacyTag,
  unsavedChangeTag,
  height,
  csrfToken,
}: Props) {
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [bioValue, setBioValue] = useState(initialBio)
  const {
    isEditorOpen,
    fieldValue,
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
    defaultValue: bioValue,
    schema: bioSchema,
    name: 'bio',
    shouldSaveToLocalStorage: true,
  })

  const { shadowRef, wordCount, handleInput } = useEditableMultiLineText({
    editorRef,
    isEditorOpen,
  })
  const { openErrorSnackbar } = useErrorSnackbar()

  const handleHttpError = (err: HttpError) => {
    if (err.status === 404) {
      saveFieldValueToLocalStorage()
      router.replace(redirectLoginPath)
    } else if (err.status === 422) {
      if (err.message.startsWith('自己紹介')) {
        setFieldError({
          type: err.status.toString(),
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
    const result = await changeBio({ csrfToken, ...data })
    if (result instanceof Error) {
      if (result instanceof HttpError) {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
      setBioValue(result.data.bio)
      updateField(result.data.bio)
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
            defaultValue={fieldValue}
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
        <CollapsibleSection height={height} className="z-10">
          <DetailItemContentLayout>
            {bioValue === '' ? (
              <p className="text-gray-500">自己紹介を登録してください...</p>
            ) : (
              <DetailMultiLineText>{bioValue}</DetailMultiLineText>
            )}
          </DetailItemContentLayout>
        </CollapsibleSection>
      </EditableText>
    </div>
  )
}
