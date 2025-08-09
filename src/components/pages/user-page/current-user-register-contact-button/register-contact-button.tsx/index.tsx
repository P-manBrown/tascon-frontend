'use client'

import { Button } from '@/components/buttons/button'
import { useRegisterContactButton } from './use-register-contact-button'

type Props = {
  currentUserId: string
  contactUserId: string
}

export function RegisterContactButton({ currentUserId, contactUserId }: Props) {
  const { isPending, handleClick } = useRegisterContactButton({
    currentUserId,
    contactUserId,
  })

  return (
    <Button
      className="btn-primary"
      status={isPending ? 'pending' : 'idle'}
      onClick={handleClick}
    >
      登録
    </Button>
  )
}
