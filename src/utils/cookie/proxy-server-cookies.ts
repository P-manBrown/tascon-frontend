import 'server-only'
import { cookies } from 'next/headers'
import setCookieParser from 'set-cookie-parser'

export function proxyServerCookies(headers: Headers) {
  const setCookie = headers.get('set-cookie')

  if (setCookie !== null) {
    const splitCookieHeaders = setCookieParser.splitCookiesString(setCookie)
    const cookieObjects = setCookieParser.parse(splitCookieHeaders)

    cookieObjects.forEach((cookieObject) => {
      const { name, value, sameSite, ...rest } = cookieObject
      cookies().set(name, value, {
        sameSite: sameSite === 'strict' ? 'strict' : 'lax',
        ...rest,
      })
    })
  }
}
