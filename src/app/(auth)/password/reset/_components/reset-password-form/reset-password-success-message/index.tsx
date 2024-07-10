import { useState } from 'react'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { Button } from '@/components/buttons/button'
import { HorizontalRule } from '@/components/horizontal-rule'
import { IconMessage } from '@/components/icon-message'
import { HttpError } from '@/utils/error/custom/http-error'
import { resetPassword } from '../reset-password.api'

type Props = {
  message: string
  email: string
  csrfToken: string
}

export function ResetPasswordSuccessMessage({
  message,
  email,
  csrfToken,
}: Props) {
  const [isSending, setIsSending] = useState(false)
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const handleClick = async () => {
    setIsSending(true)
    const result = await resetPassword({ csrfToken, email })
    if (result instanceof Error) {
      if (result instanceof HttpError) {
        openSnackbar({
          severity: 'error',
          message: `${result.message}`,
        })
      }
    } else {
      openSnackbar({
        severity: 'success',
        message: '再設定用メールを再送信しました。',
      })
    }
    setIsSending(false)
  }

  return (
    <IconMessage severity="success" title="再設定用メール送信完了">
      <p className="break-words">
        {message}
        <br />
        内容を確認してパスワードを再設定してください。
      </p>
      <HorizontalRule className="my-6">メールが届かない場合</HorizontalRule>
      <div className="mx-auto w-11/12 lg:w-4/5">
        <Button
          type="button"
          className="btn-primary"
          autoFocus={true}
          status={isSending ? 'pending' : 'idle'}
          onClick={handleClick}
        >
          再設定用メールを再送信
        </Button>
      </div>
    </IconMessage>
  )
}
