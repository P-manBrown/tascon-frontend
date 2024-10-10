import { Avatar, LoadingAvatar } from '@/components/avatars/avatar'
import { validateToken } from '@/utils/api/server/validate-token'
import { AvatarEditor } from './avatar-editor'

type Props = {
  csrfToken: string
}

const size = 128

export async function EditableAvatar({ csrfToken }: Props) {
  const validateTokenResult = await validateToken()
  if (validateTokenResult instanceof Error) {
    throw validateTokenResult
  }
  const { name, avatarUrl } = validateTokenResult.data

  return (
    <AvatarEditor csrfToken={csrfToken} avatarUrl={avatarUrl}>
      <Avatar name={name} avatarUrl={avatarUrl} size={size} />
    </AvatarEditor>
  )
}

export function LoadingEditableAvatar() {
  return <LoadingAvatar size={size} />
}
