import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { PrivateModeCheckbox } from './private-mode-checkbox'
import {
  LoadingToggleSwitch,
  ToggleSwitch,
} from './private-mode-checkbox/toggle-switch'

const descriptionLayoutClasses = 'ml-3 align-middle'

export async function PrivateModeSwitch() {
  const { data: currentUser } = await getCurrentUser()

  return (
    <PrivateModeCheckbox
      isPrivate={currentUser.isPrivate}
      toggleIcon={<ToggleSwitch isToggleOn={currentUser.isPrivate} />}
      description={
        <span className={descriptionLayoutClasses}>
          メールアドレスでの検索・登録を拒否する
        </span>
      }
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
