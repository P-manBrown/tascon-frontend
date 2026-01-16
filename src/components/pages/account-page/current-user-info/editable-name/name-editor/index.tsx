'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { EditableText } from '@/components/editable-fields/editable-text'
import { useEditableText } from '@/components/editable-fields/editable-text/use-editable-text'
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
    } else {
      openErrorSnackbar(err)
    }
  }

  const onSubmit = async (data: ChangeNameFormValue) => {
    startTransition(async () => {
      const result = await changeName(data)
      if (result.status === 'error') {
        if (result.name === 'HttpError') {
          handleHttpError(result)
        } else {
          openErrorSnackbar(result)
        }
      } else {
        updateField(result.account.name)
      }
    })
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
