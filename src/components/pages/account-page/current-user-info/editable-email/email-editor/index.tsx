'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useRef } from 'react'
import { z } from 'zod'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { EditableText } from '@/components/editable-fields/editable-text'
import { useEditableText } from '@/components/editable-fields/editable-text/use-editable-text'
import { TextField } from '@/components/form-controls/text-field'
import { DetailItemHeadingLayout } from '@/components/layouts/detail-item-heading-layout'
import { signUpSchema } from '@/schemas/request/auth'
import { ErrorObject } from '@/types/error'
import { HttpError } from '@/utils/error/custom/http-error'
import { createFormErrorsSchema } from '@/utils/form/create-form-errors-schema'
import { generateFromUrlParam } from '@/utils/login-path/generate-from-url-param'
import { useRedirectLoginPath } from '@/utils/login-path/use-redirect-login-path'
import { isValidValue } from '@/utils/type-guard/is-valid-value'
import { changeEmail } from './change-email.api'
import type { SubmitHandler } from 'react-hook-form'

const emailSchema = signUpSchema.pick({ email: true })
type ChangeEmailFormValue = z.infer<typeof emailSchema>
type Props = Pick<React.ComponentProps<typeof EditableText>, 'children'> & {
  currentUserId: string
  provider: string
  initialEmail: string
  label: React.ReactElement
  privacyTag: React.ReactElement
}

const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

const formErrorsSchema = createFormErrorsSchema(z.enum(['email']))

export function EmailEditor({
  currentUserId,
  provider,
  initialEmail,
  label,
  privacyTag,
  children,
}: Props) {
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { openErrorSnackbar } = useErrorSnackbar()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectLoginPath = useRedirectLoginPath({ searchParams })
  const editorRef = useRef<HTMLInputElement>(null)

  const {
    updateField,
    isSubmitting,
    handleFormSubmit,
    handleCancelClick,
    handleBlur,
    registerReturn,
    fieldError,
    handleFormErrors,
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
    const { statusCode, data } = err
    if (statusCode === 404) {
      saveFieldValueToLocalStorage()
      router.replace(redirectLoginPath)
    } else if (isValidValue(formErrorsSchema, data)) {
      handleFormErrors({ ...data, shouldFocus: false })
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

    const result = await changeEmail({ ...data, confirmSuccessUrl })
    if (result.status === 'error') {
      if (result.name === 'HttpError') {
        handleHttpError(result)
      } else {
        openErrorSnackbar(result)
      }
    } else {
      updateField(result.account.email)
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
