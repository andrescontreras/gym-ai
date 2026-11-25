import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSafeNext } from '@/lib/auth/safe-redirect'
import { getSupabaseEnv } from '@/lib/supabase/env'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/session',
  '/progress',
  '/routines',
  '/history',
  '/onboarding',
  '/profile',
]
const GUEST_ONLY_PATHS = ['/login', '/signup']
const AUTH_COOKIE = /^sb-.+-auth-token(\.\d+)?$/

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

function isProtected(pathname: string) {
  return pathname === '/' || PROTECTED_PREFIXES.some((prefix) => matchesPath(pathname, prefix))
}

function redirectWith(target: URL, from: NextResponse, headers: Record<string, string>) {
  const redirect = NextResponse.redirect(target)
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  Object.entries(headers).forEach(([key, value]) => redirect.headers.set(key, value))
  return redirect
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  request.headers.set('x-pathname', `${pathname}${search}`)

  let response = NextResponse.next({ request })
  let authHeaders: Record<string, string> = {}

  const { url, anonKey } = getSupabaseEnv()
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        authHeaders = headers
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const isSignedIn = Boolean(data?.claims)

  if (pathname === '/api' || pathname.startsWith('/api/')) return response

  if (!isSignedIn && isProtected(pathname)) {
    const target = new URL('/login', request.url)
    const next = getSafeNext(`${pathname}${search}`)
    if (next !== '/') target.searchParams.set('next', next)
    const hadSession = request.cookies.getAll().some(({ name }) => AUTH_COOKIE.test(name))
    if (hadSession) target.searchParams.set('reason', 'expired')
    return redirectWith(target, response, authHeaders)
  }

  if (isSignedIn && GUEST_ONLY_PATHS.some((path) => matchesPath(pathname, path))) {
    return redirectWith(new URL('/', request.url), response, authHeaders)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
