import 'server-only'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const getCsrfToken = cache(() => {
  const csrfToken = cookies().get('csrf_token')?.value
  if (!csrfToken) {
    return new Error('"csrf_token" is not found in cookies.')
  }

  return csrfToken
})
