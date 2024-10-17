'use client'

import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { EditableText } from '@/components/editable-text'
import { useEditableText } from '@/components/editable-text/use-editable-text'
import { TextField } from '@/components/form-controls/text-field'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { signUpSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { generateFromUrlParam } from '@/utils/login-path/generate-from-url-param'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { changeEmail } from './change-email.api'
import type { SubmitHandler } from 'react-hook-form'
import type { z } from 'zod'

const emailSchema = signUpSchema.pick({ email: true })
type ChangeEmailFormValue = z.infer<typeof emailSchema>
type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  provider: string
  initialEmail: string
  label: React.ReactElement
  privacyTag: React.ReactElement
  csrfToken: string
}

const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export function EmailEditor({
  currentUserId,
  provider,
  initialEmail,
  label,
  privacyTag,
  csrfToken,
  children,
}: Props) {
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const redirectLoginPath = useRedirectLoginPath()
  const editorRef = useRef<HTMLInputElement>(null)

  const {
    updateField,
    isSubmitting,
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
    defaultValue: initialEmail,
    schema: emailSchema,
    name: 'email',
    shouldSaveToLocalStorage: false,
  })

  const handleHttpError = (err: ErrorObject<HttpError>) => {
    if (err.statusCode === 404) {
      saveFieldValueToLocalStorage()
      router.replace(redirectLoginPath)
    } else if (err.statusCode === 422) {
      if (err.message.startsWith('メールアドレス')) {
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
    if (result.status === 'error') {
      if (result.name === 'HttpError') {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
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
        {...rest}
      >
        {children}
      </EditableText>
    </div>
  )
}
