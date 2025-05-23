import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'bearerToken'

type SetBearerTokenParams = {
  bearerToken: string
  expiry: string | number
}

export async function setBearerToken({
  bearerToken,
  expiry,
}: SetBearerTokenParams) {
  const cookieStore = await cookies()

  const expiryDate = new Date(Number(expiry) * 1000)

  cookieStore.set(COOKIE_NAME, bearerToken, {
    httpOnly: true,
    sameSite: 'lax',
    expires: expiryDate,
  })
}

export async function getBearerToken() {
  const cookieStore = await cookies()
  const bearerToken = cookieStore.get(COOKIE_NAME)?.value ?? ''

  return bearerToken
}

export async function deleteBearerToken() {
  const cookieStore = await cookies()

  cookieStore.delete(COOKIE_NAME)
}
