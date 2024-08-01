'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { EditableText } from '@/components/editable-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextField } from '@/components/form-controls/text-field'
import { DetailItemContentLayout } from '@/components/layouts/detail-item-content-layout'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { DetailSingleLineText } from '@/components/texts/detail-single-line-text'
import { signUpSchema } from '@/schemas/request/auth'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateFromUrlParam } from '@/utils/login-path/generate-from-url-param'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeEmail } from './change-email.api'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

const emailSchema = signUpSchema.pick({ email: true })
type ChangeEmailFormValue = z.infer<typeof emailSchema>
type Props = {
  currentUserId: string
  provider: string
  initialEmail: string
  label: React.ReactElement
  privacyTag: React.ReactElement
  unsavedChangeTag: React.ReactElement
  csrfToken: string
}

const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export function EditableEmail({
  currentUserId,
  provider,
  initialEmail,
  label,
  privacyTag,
  unsavedChangeTag,
  csrfToken,
}: Props) {
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const editorRef = useRef<HTMLInputElement>(null)
  const [emailValue, setEmailValue] = useState(initialEmail)

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
  } = useEditableText<ChangeEmailFormValue>({
    editorRef,
    currentUserId,
    defaultValue: emailValue,
    schema: emailSchema,
    name: 'email',
    shouldSaveToLocalStorage: false,
  })

  const handleHttpError = (err: HttpError) => {
    if (err.status === 404) {
      saveFieldValueToLocalStorage()
      router.replace(redirectLoginPath)
    } else if (err.status === 422) {
      if (err.message.startsWith('メールアドレス')) {
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

  const onSubmit: SubmitHandler<ChangeEmailFormValue> = async (data) => {
    let confirmSuccessUrl
    if (provider === 'email') {
      const fromUrl = generateFromUrlParam('/account', null)
      confirmSuccessUrl = `${origin}/login?${fromUrl}`
    } else {
      confirmSuccessUrl = `${origin}/account`
    }

    const result = await changeEmail({
      csrfToken,
      ...data,
      confirmSuccessUrl,
    })
    if (result instanceof Error) {
      if (result instanceof HttpError) {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
      setEmailValue(result.data.email)
      updateField(result.data.email)
      closeEditor()
      openSnackbar({
        severity: 'success',
        message: `'${data.email}' に確認用メールを送信しました。`,
      })
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
          <div>
            <p className="text-sm">
              保存後に確認用メールからメールアドレスを認証する必要があります。
            </p>
            <TextField
              ref={editorRef}
              type="email"
              defaultValue={emailValue}
              autoFocus={true}
              register={registerReturn}
              errors={fieldError}
              readOnly={isSubmitting}
            />
          </div>
        }
        onFormSubmit={handleFormSubmit(onSubmit)}
        onCancelClick={handleCancelClick}
        onBlur={handleBlur(onSubmit)}
        isSubmitting={isSubmitting}
        hasLocalStorageValue={hasLocalStorageValue}
        {...rest}
      >
        <DetailItemContentLayout>
          <DetailSingleLineText>{emailValue}</DetailSingleLineText>
        </DetailItemContentLayout>
      </EditableText>
    </div>
  )
}
