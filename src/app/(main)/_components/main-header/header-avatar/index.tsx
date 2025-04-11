import { Avatar } from '@/components/avatars/avatar'
import { LoadingAvatar } from '@/components/avatars/avatar'
import { getCurrentUser } from '@/utils/api/server/get-current-user'

const size = 32

export async function HeaderAvatar() {
  const { account: currentUser } = await getCurrentUser()

  return (
    <Avatar
      name={currentUser.name}
      avatarUrl={currentUser.avatarUrl}
      size={size}
      priority={true}
    />
  )
}

export function LoadingHeaderAvatar() {
  return <LoadingAvatar size={size} />
}
