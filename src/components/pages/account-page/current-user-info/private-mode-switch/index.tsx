import { validateToken } from '@/utils/api/server/validate-token'
import { PrivateModeCheckbox } from './private-mode-checkbox'
import {
  LoadingToggleSwitch,
  ToggleSwitch,
} from './private-mode-checkbox/toggle-switch'

type Props = {
  csrfToken: string
}

const descriptionLayoutClasses = 'ml-3 align-middle'

export async function PrivateModeSwitch({ csrfToken }: Props) {
  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    throw validateTokenResult
  }
  const { isPrivate } = validateTokenResult.data

  return (
    <PrivateModeCheckbox
      isPrivate={isPrivate}
      toggleIcon={<ToggleSwitch isToggleOn={isPrivate} />}
      description={
        <span className={descriptionLayoutClasses}>
          メールアドレスでの検索・登録を拒否する
        </span>
      }
      csrfToken={csrfToken}
    />
  )
}

export function LoadingPrivateModeSwitch() {
  return (
    <>
      <LoadingToggleSwitch />
      <span className={descriptionLayoutClasses}>
        メールアドレスでの検索・登録を拒否する
      </span>
    </>
  )
}
