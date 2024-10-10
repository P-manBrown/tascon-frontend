import Avatar from 'boring-avatars'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type CurrentUserAvatarProps = Pick<
  React.ComponentProps<typeof Avatar>,
  'avatarUrl' | 'name'
>

type UpdateCurrentUserAvatarParams = Pick<CurrentUserAvatarProps, 'name'> & {
  avatarUrl?: CurrentUserAvatarProps['avatarUrl']
}

type CurrentUserAvatarState = {
  currentUserAvatar: CurrentUserAvatarProps
  updateCurrentUserAvatar: (
    currentUserAvatar: UpdateCurrentUserAvatarParams,
  ) => void
}

export const useCurrentUserAvatarStore = create<CurrentUserAvatarState>()(
  devtools((set) => ({
    currentUserAvatar: {
      avatarUrl: null,
      name: '',
    },
    updateCurrentUserAvatar: (currentUserAvatar) =>
      set((state) => ({
        currentUserAvatar: { ...state.currentUserAvatar, ...currentUserAvatar },
      })),
  })),
)
