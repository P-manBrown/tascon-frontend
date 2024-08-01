import { NextResponse } from 'next/server'
import { fetchCsrfToken } from './utils/api/middleware/fetch-csrf-token'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!icons|logos|_next/static|favicon.ico|manifest.json).*)'],
}

const protectedPaths = [
  '/password/change',
  '/tasks',
  '/templates',
  '/users',
  '/account',
]

const origin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN

export async function middleware(req: NextRequest) {
  const reqHeaders = new Headers(req.headers)

  // Redirect to the login page if the user is not authenticated.
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    const hasAuthCookie = req.cookies.has('auth_cookie')
    if (!hasAuthCookie) {
      const loginUrl = new URL('/login', req.url)
      const fromUrl = `${origin}${req.nextUrl.pathname}${req.nextUrl.search}`
      loginUrl.searchParams.set('from_url', fromUrl)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Add the pathname and query parameters to the request headers.
  reqHeaders.set('Tascon-Pathname', req.nextUrl.pathname)
  reqHeaders.set('Tascon-Params', req.nextUrl.searchParams.toString())

  if (req.cookies.has('_tascon_session') && req.cookies.has('csrf_token')) {
    return NextResponse.next({
      request: {
        headers: reqHeaders,
      },
    })
  }

  // Set the CSRF token cookie.
  const result = await fetchCsrfToken()
  if (result instanceof Error) {
    // Ensure that error pages are displayed correctly.
    return NextResponse.next({
      request: {
        headers: reqHeaders,
      },
    })
  }
  const { headers: resHeaders, data } = result
  const { csrfToken } = data
  // Add the CSRF token cookie to the request headers.
  const reqCookies = reqHeaders.get('Cookie') ?? ''
  reqHeaders.set('Cookie', `csrf_token=${csrfToken}; ${reqCookies}`)

  const res = NextResponse.next({
    headers: resHeaders,
    request: {
      headers: reqHeaders,
    },
  })
  // Set the CSRF token cookie in the client.
  res.cookies.set({
    name: 'csrf_token',
    value: csrfToken,
    httpOnly: true,
    sameSite: 'lax',
  })
  return res
}
