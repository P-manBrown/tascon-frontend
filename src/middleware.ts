import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!icons|logos|_next/static|favicon.ico|manifest.json).*)'],
}

const protectedPaths = ['/tasks', '/templates', '/users', '/account']

const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export async function middleware(req: NextRequest) {
  const reqHeaders = new Headers(req.headers)
  const nextUrl = req.nextUrl

  // Redirect to the login page if the user is not authenticated.
  if (protectedPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    const hasBearerTokenCookie = req.cookies.has('bearerToken')
    if (!hasBearerTokenCookie) {
      const loginUrl = new URL('/login', req.url)
      const fromUrl = `${origin}${nextUrl.pathname}${nextUrl.search}`
      loginUrl.searchParams.set('from_url', fromUrl)
      loginUrl.searchParams.set('err', 'unauthorized')
      return NextResponse.redirect(loginUrl)
    }
  }

  if (nextUrl.pathname === '/password/reset') {
    const resetPasswordToken = nextUrl.searchParams.get('reset_password_token')
    if (resetPasswordToken !== null) {
      nextUrl.searchParams.delete('reset_password_token')
      const res = NextResponse.redirect(nextUrl)
      res.cookies.set({
        name: 'resetPasswordToken',
        value: resetPasswordToken,
        httpOnly: true,
        sameSite: 'lax',
        path: '/password/reset',
      })
      return res
    }

    const hasResetPasswordTokenCookie = req.cookies.has('resetPasswordToken')
    if (!hasResetPasswordTokenCookie) {
      const forgotUrl = new URL('/password/forgot', req.url)
      forgotUrl.searchParams.set('err', 'token_not_found')
      return NextResponse.redirect(forgotUrl)
    }
  }

  // Add the pathname and query parameters to the request headers.
  reqHeaders.set('Tascon-Pathname', nextUrl.pathname)
  reqHeaders.set('Tascon-Params', nextUrl.searchParams.toString())

  return NextResponse.next({
    request: {
      headers: reqHeaders,
    },
  })
}
