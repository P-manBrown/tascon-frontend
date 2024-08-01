'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useCurrentUserAvatarStore } from '@/components/avatars/current-user-avatar/use-current-user-avatar-store'
import { EditableText } from '@/components/editable-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextField } from '@/components/form-controls/text-field'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { DetailSingleLineText } from '@/components/texts/detail-single-line-text'
import { signUpSchema } from '@/schemas/request/auth'
import { HttpError } from '@/utils/error/custom/http-error'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeName } from './change-name.api'
import type { z } from 'zod'

const nameSchema = signUpSchema.pick({ name: true })

type ChangeNameFormValue = z.infer<typeof nameSchema>
type Props = {
  currentUserId: string
  initialName: string
  label: React.ReactElement
  privacyTag: React.ReactElement
  unsavedChangeTag: React.ReactElement
  csrfToken: string
}

export function EditableName({
  currentUserId,
  initialName,
  label,
  privacyTag,
  unsavedChangeTag,
  csrfToken,
}: Props) {
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const editorRef = useRef<HTMLInputElement>(null)
  const [nameValue, setNameValue] = useState(initialName)
  const updateCurrentUserAvatar = useCurrentUserAvatarStore(
    (state) => state.updateCurrentUserAvatar
  )
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
    defaultValue: nameValue,
    schema: nameSchema,
    name: 'name',
    shouldSaveToLocalStorage: true,
  })

  const handleHttpError = (err: HttpError) => {
    if (err.status === 404) {
      saveFieldValueToLocalStorage()
      router.replace(redirectLoginPath)
    } else if (err.status === 422) {
      if (err.message.startsWith('ユーザー名')) {
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

  const onSubmit = async (data: ChangeNameFormValue) => {
    const result = await changeName({
      csrfToken,
      ...data,
    })
    if (result instanceof Error) {
      if (result instanceof HttpError) {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
      setNameValue(result.data.name)
      updateField(result.data.name)
      updateCurrentUserAvatar({ name: result.data.name })
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
            defaultValue={nameValue}
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
        <DetailItemContentLayout>
          <DetailSingleLineText>{nameValue}</DetailSingleLineText>
        </DetailItemContentLayout>
      </EditableText>
    </div>
  )
}
