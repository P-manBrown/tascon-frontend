import { useEffect, useState } from 'react'
import { Avatar } from '@/components/avatars/avatar'
import { useCurrentUserAvatarStore } from './use-current-user-avatar-store'

export function CurrentUserAvatar({
  avatarUrl,
  name,
  size,
  ...rest
}: React.ComponentProps<typeof Avatar>) {
  const [isClient, setIsClient] = useState(false)
  const currentUserAvatar = useCurrentUserAvatarStore(
    (state) => state.currentUserAvatar
  )
  const updateCurrentUserAvatar = useCurrentUserAvatarStore(
    (state) => state.updateCurrentUserAvatar
  )

  useEffect(() => {
    updateCurrentUserAvatar({ name, avatarUrl })
    setIsClient(true)
  }, [updateCurrentUserAvatar, avatarUrl, name])

  return isClient ? (
    <Avatar
      avatarUrl={currentUserAvatar.avatarUrl}
      name={currentUserAvatar.name}
      size={size}
      {...rest}
    />
  ) : (
    <span
      className="block"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  )
}
