'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextField } from '@/components/form-controls/text-field'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { signUpSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeName } from './change-name.api'
import type { z } from 'zod'

const nameSchema = signUpSchema.pick({ name: true })

type ChangeNameFormValue = z.infer<typeof nameSchema>
type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  initialName: string
  label: React.ReactElement
  privacyTag: React.ReactElement
  unsavedChangeTag: React.ReactElement
}

export function NameEditor({
  currentUserId,
  initialName,
  label,
  privacyTag,
  unsavedChangeTag,
  children,
}: Props) {
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const editorRef = useRef<HTMLInputElement>(null)
  const {
    updateField,
    isSubmitting,
    hasLocalStorageValue,
    handleFormSubmit,
    handleCancelClick,
    handleBlur,
    registerReturn,
    fieldError,
    setFieldError,
    closeEditor,
    saveFieldValueToLocalStorage,
    ...rest
  } = useEditableText<ChangeNameFormValue>({
    editorRef,
    currentUserId,
    defaultValue: initialName,
    schema: nameSchema,
    name: 'name',
    shouldSaveToLocalStorage: true,
  })

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 404) {
      saveFieldValueToLocalStorage()
      router.replace(redirectLoginPath)
    } else if (err.statusCode === 422) {
      if (err.message.startsWith('ユーザー名')) {
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

  const onSubmit = async (data: ChangeNameFormValue) => {
    const result = await changeName(data)
    if (result.status === 'error') {
      if (result.name === 'HttpError') {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
      updateField(result.data.name)
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
          <TextField
            ref={editorRef}
            type="text"
            readOnly={isSubmitting}
            register={registerReturn}
            errors={fieldError}
          />
        }
        onFormSubmit={handleFormSubmit(onSubmit)}
        onCancelClick={handleCancelClick}
        onBlur={handleBlur(onSubmit)}
        isSubmitting={isSubmitting}
        hasLocalStorageValue={hasLocalStorageValue}
        {...rest}
      >
        {children}
      </EditableText>
    </div>
  )
}
