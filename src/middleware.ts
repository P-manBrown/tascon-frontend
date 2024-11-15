import { NextResponse } from 'next/server'
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

  // Add the pathname and query parameters to the request headers.
  reqHeaders.set('Tascon-Pathname', req.nextUrl.pathname)
  reqHeaders.set('Tascon-Params', req.nextUrl.searchParams.toString())

  // Redirect to the login page if the user is not authenticated.
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    const hasAuthorizationCookie = req.cookies.has('authorization')
    if (!hasAuthorizationCookie) {
      const loginUrl = new URL('/login', req.url)
      const fromUrl = `${origin}${req.nextUrl.pathname}${req.nextUrl.search}`
      loginUrl.searchParams.set('from_url', fromUrl)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next({
    request: {
      headers: reqHeaders,
    },
  })
}
