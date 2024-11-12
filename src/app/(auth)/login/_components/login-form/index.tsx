'use client'

import Link from 'next/link'
import { useId } from 'react'
import { Button } from '@/components/buttons/button'
import { IconButton } from '@/components/buttons/icon-button'
import { Label } from '@/components/form-controls/label'
import { TextField } from '@/components/form-controls/text-field'
import { VisibilityToggleIcon } from '@/components/visibility-toggle-icon'
import { useVisibilityToggle } from '@/components/visibility-toggle-icon/use-visibility-toggle'
import { useLoginForm } from './use-login-form'
import type { LabeledTextFields } from '@/types/labeled-text-fields'

export function LoginForm() {
  const id = useId()
  const { register, handleSubmit, onSubmit, isSubmitting, errors } =
    useLoginForm()
  const { isVisible, toggleVisible } = useVisibilityToggle()

  const labeledTextFields: LabeledTextFields = [
    {
      id: `${id}-email`,
      type: 'email',
      label: 'メールアドレス',
      autoComplete: 'email',
      register: register('email'),
      errors: errors.email,
    },
    {
      id: `${id}-password`,
      type: isVisible ? 'text' : 'password',
      label: 'パスワード',
      autoComplete: 'current-password',
      register: register('password'),
      errors: errors.password,
      suffixIcon: (
        <IconButton
          type="button"
          aria-label={isVisible ? 'パスワードを隠す' : 'パスワードを表示する'}
          onClick={toggleVisible}
        >
          <VisibilityToggleIcon isVisible={isVisible} className="size-5" />
        </IconButton>
      ),
    },
  ]

  return (
    <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {labeledTextFields.map((labeledTextField) => (
          <div key={labeledTextField.id}>
            <Label htmlFor={labeledTextField.id}>
              {labeledTextField.label}
            </Label>
            <TextField
              id={labeledTextField.id}
              type={labeledTextField.type}
              autoComplete={labeledTextField.autoComplete}
              readOnly={isSubmitting}
              register={labeledTextField.register}
              errors={labeledTextField.errors}
              suffixIcon={labeledTextField.suffixIcon}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-end">
        <Link href="/password/reset" className="link">
          パスワードを忘れた場合はこちら
        </Link>
      </div>
      <Button
        type="submit"
        className="btn-primary mt-8"
        status={isSubmitting ? 'pending' : 'idle'}
      >
        ログイン
      </Button>
    </form>
  )
}
