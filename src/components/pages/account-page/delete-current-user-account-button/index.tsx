import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { DeleteAccountButton } from './delete-account-button'

export async function DeleteCurrentUserAccountButton() {
  const { account: currentUser } = await getCurrentUser()
  const currentUserId = currentUser.id.toString()

  return <DeleteAccountButton currentUserId={currentUserId} />
}

export function LoadingDeleteCurrentUserAccountButton() {
  return <div className="skeleton shape-btn" />
}
