import { useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { Button } from '@/components/buttons/button'
import { HorizontalRule } from '@/components/horizontal-rule'
import { IconMessage } from '@/components/icon-message'
import { resendConfirmationEmail } from './resend-confirmation-email.api'

type Props = {
  email: string
}

export function SignUpSuccessMessage({ email }: Props) {
  const [isSending, setIsSending] = useState(false)
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const { openErrorSnackbar } = useErrorSnackbar()

  const handleClick = async () => {
    setIsSending(true)
    const result = await resendConfirmationEmail({ email })
    if (result.status === 'error') {
      openErrorSnackbar(result)
    } else {
      openSnackbar({
        severity: 'success',
        message: '確認用メールを再送信しました。',
      })
    }
    setIsSending(false)
  }

  return (
    <IconMessage severity="success" title="新規登録完了">
      <p className="break-words">
        {`'${email}' に確認用メールを送信しました。`}
        <br />
        内容を確認してメールアドレスを認証してください。
      </p>
      <HorizontalRule className="my-6">メールが届かない場合</HorizontalRule>
      <div className="mx-auto w-11/12 lg:w-4/5">
        <Button
          type="button"
          className="btn-primary"
          status={isSending ? 'pending' : 'idle'}
          onClick={handleClick}
        >
          確認用メールを再送信
        </Button>
      </div>
    </IconMessage>
  )
}
