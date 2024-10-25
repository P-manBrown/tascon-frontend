import { Avatar, LoadingAvatar } from '@/components/avatars/avatar'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { AvatarEditor } from './avatar-editor'

type Props = {
  csrfToken: string
}

const size = 128

export async function EditableAvatar({ csrfToken }: Props) {
  const { data: currentUser } = await getCurrentUser()

  return (
    <AvatarEditor csrfToken={csrfToken} avatarUrl={currentUser.avatarUrl}>
      <Avatar
        name={currentUser.name}
        avatarUrl={currentUser.avatarUrl}
        size={size}
      />
    </AvatarEditor>
  )
}

export function LoadingEditableAvatar() {
  return <LoadingAvatar size={size} />
}
