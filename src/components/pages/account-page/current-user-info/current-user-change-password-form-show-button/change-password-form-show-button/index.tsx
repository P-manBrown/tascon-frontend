'use client'

import { Button } from '@/components/buttons/button'
import { CurrentPasswordInput } from './current-password-input'
import { NewPasswordInput } from './new-password-input'
import { useChangePasswordFormShowButton } from './use-change-password-form-show-button'

type Props = {
  provider: string
  name: string
  email: string
}

export function ChangePasswordFormShowButton({ provider, name, email }: Props) {
  const {
    isShown,
    showForm,
    isSending,
    register,
    handleSubmit,
    isSubmitting,
    errors,
    handleResetPasswordButtonClick,
    onSubmit,
  } = useChangePasswordFormShowButton({ email })

  return isShown ? (
    <form noValidate={true} onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        autoComplete="username"
        value={name}
        className="hidden"
        readOnly={true}
      />
      <input
        type="email"
        autoComplete="email"
        value={email}
        className="hidden"
        readOnly={true}
      />
      <CurrentPasswordInput
        readOnly={isSubmitting}
        register={register('currentPassword')}
        errors={errors.currentPassword}
      />
      <div className="mt-2 flex justify-end">
        <Button
          type="button"
          className="btn-ghost h-6 w-60 text-base font-medium"
          status={isSending ? 'pending' : 'idle'}
          onClick={handleResetPasswordButtonClick}
        >
          パスワード再設定用メールを送信
        </Button>
      </div>
      <NewPasswordInput
        readOnly={isSubmitting}
        register={register('password')}
        errors={errors.password}
      />
      <Button
        type="submit"
        className="btn-primary mt-8"
        status={isSubmitting ? 'pending' : 'idle'}
      >
        パスワード変更
      </Button>
    </form>
  ) : (
    <Button
      type="button"
      className="btn-success"
      status={provider !== 'email' ? 'disabled' : 'idle'}
      onClick={showForm}
    >
      {provider !== 'email'
        ? 'SNS認証のため変更できません'
        : 'パスワードを変更する'}
    </Button>
  )
}
