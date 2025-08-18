import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { RegisterContactButton } from './register-contact-button.tsx'

type Props = {
  userId: React.ComponentProps<typeof RegisterContactButton>['contactUserId']
}

export async function CurrentUserRegistraterContactButton({ userId }: Props) {
  const { account: currentUser } = await getCurrentUser()

  return (
    <RegisterContactButton
      currentUserId={currentUser.id.toString()}
      contactUserId={userId}
    />
  )
}

export function LoadingCurrentUserRegistraterContactButton() {
  return <div className="skeleton shape-btn" />
}
