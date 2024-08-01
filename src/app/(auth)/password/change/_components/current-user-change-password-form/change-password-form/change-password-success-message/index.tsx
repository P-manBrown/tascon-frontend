import { IconMessage } from '@/components/icon-message'
import { NextActionButton } from '../next-action-button'

export function ChangePasswordSuccessMessage() {
  return (
    <IconMessage severity="success" title="パスワード変更完了">
      <p className="mb-5 text-center">パスワードを変更しました。</p>
      <NextActionButton />
    </IconMessage>
  )
}
