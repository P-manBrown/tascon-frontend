import { useState } from 'react'
import { useErrorSnackbar } from '@/app/_components/snackbars/snackbar/use-error-snackbar'
import { useSnackbarsStore } from '@/app/_components/snackbars/use-snackbars-store'
import { Button } from '@/components/buttons/button'
import { HorizontalRule } from '@/components/horizontal-rule'
import { IconMessage } from '@/components/icon-message'
import { requestResetPasswordEmail } from '@/utils/api/request-reset-password-email'

type Props = {
  email: string
}

export function RequestResetPasswordEmailSuccessMessage({ email }: Props) {
  const [isSending, setIsSending] = useState(false)
  const { openErrorSnackbar } = useErrorSnackbar()
  const openSnackbar = useSnackbarsStore((state) => state.openSnackbar)
  const handleClick = async () => {
    setIsSending(true)
    const result = await requestResetPasswordEmail({ email })
    if (result.status === 'error') {
      openErrorSnackbar(result)
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
        {`'${email}' にパスワードリセットの案内を送信しました。`}
        <br />
        内容を確認してパスワードを再設定してください。
      </p>
      <HorizontalRule className="my-6">メールが届かない場合</HorizontalRule>
      <div className="mx-auto w-11/12 lg:w-4/5">
        <Button
          type="button"
          className="btn-primary"
          status={isSending ? 'pending' : 'idle'}
          onClick={handleClick}
        >
          再設定用メールを再送信
        </Button>
      </div>
    </IconMessage>
  )
}
