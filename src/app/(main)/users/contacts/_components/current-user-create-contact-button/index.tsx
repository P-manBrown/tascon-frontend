import { getCurrentUser } from '@/utils/api/server/get-current-user'
import { CreateContactButton } from './create-contact-button'

const shapeClasses = 'h-10 md:w-20'

export async function CurrentUserCreateContactButton() {
  const { account: currentUser } = await getCurrentUser()

  return (
    <CreateContactButton
      currentUserId={currentUser.id.toString()}
      className={shapeClasses}
    />
  )
}

export function LoadingCurrentUserCreateContactButton() {
  return <div className={`skeleton shape-btn ${shapeClasses}`} />
}
