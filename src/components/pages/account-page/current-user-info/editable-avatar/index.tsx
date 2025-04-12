import { Avatar, LoadingAvatar } from '@/components/avatars/avatar'
import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { AvatarEditor } from './avatar-editor'

const size = 128

export async function EditableAvatar() {
  const { account: currentUser } = await getCurrentUser()

  return (
    <AvatarEditor avatarUrl={currentUser.avatarUrl}>
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
