import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'authorization'

export function setAuthorization(headers: Headers) {
  const authorization = headers.get('Authorization')
  const expiry = headers.get('expiry')

  if (authorization && expiry) {
    const expiryDate = new Date(Number(expiry) * 1000)
    cookies().set(COOKIE_NAME, authorization, {
      httpOnly: true,
      expires: expiryDate,
    })
  }
}

export function getAuthorization() {
  const cookieStore = cookies()
  const bearerToken = cookieStore.get(COOKIE_NAME)?.value ?? ''

  return bearerToken
}

export function deleteAuthorization() {
  cookies().delete(COOKIE_NAME)
}
