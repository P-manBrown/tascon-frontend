import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'bearerToken'

type SetBearerTokenParams = {
  bearerToken: string
  expiry: string | number
}

export function setBearerToken({ bearerToken, expiry }: SetBearerTokenParams) {
  const expiryDate = new Date(Number(expiry) * 1000)
  cookies().set(COOKIE_NAME, bearerToken, {
    httpOnly: true,
    sameSite: 'lax',
    expires: expiryDate,
  })
}

export function getBearerToken() {
  const cookieStore = cookies()
  const bearerToken = cookieStore.get(COOKIE_NAME)?.value ?? ''

  return bearerToken
}

export function deleteBearerToken() {
  cookies().delete(COOKIE_NAME)
}
