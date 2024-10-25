import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { DeleteAccountButton } from './delete-account-button'

type Props = {
  csrfToken: string
}

export async function DeleteCurrentUserAccountButton({ csrfToken }: Props) {
  const { data: currentUser } = await getCurrentUser()
  const currentUserId = currentUser.id.toString()

  return (
    <DeleteAccountButton currentUserId={currentUserId} csrfToken={csrfToken} />
  )
}

export function LoadingDeleteCurrentUserAccountButton() {
  return <div className="skeleton shape-btn" />
}
