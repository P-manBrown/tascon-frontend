import { validateToken } from '@/utils/api/server/validate-token'
import { DeleteAccountButton } from './delete-account-button'

type Props = {
  csrfToken: string
}

export async function DeleteCurrentUserAccountButton({ csrfToken }: Props) {
  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    throw validateTokenResult
  }
  const { id } = validateTokenResult.data

  return (
    <DeleteAccountButton currentUserId={id.toString()} csrfToken={csrfToken} />
  )
}

export function LoadingDeleteCurrentUserAccountButton() {
  return <div className="skeleton shape-btn" />
}
