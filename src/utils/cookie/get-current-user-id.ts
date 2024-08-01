import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const getCurrentUserId = cache(() => {
  const currentUserId = cookies().get('current_user_id')?.value
  if (!currentUserId) {
    return new Error('"current_user_id" is not found in cookies.')
  }

  return currentUserId
})
