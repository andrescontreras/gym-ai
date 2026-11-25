import { NextResponse } from 'next/server'
import type { AuthErrorCode, AuthErrorResponse } from '@/types'
import errors from '@/messages/en/auth.json'

const STATUS_BY_CODE: Record<AuthErrorCode, number> = {
  INVALID_EMAIL: 422,
  WEAK_PASSWORD: 422,
  PASSWORDS_DONT_MATCH: 422,
  INVALID_NAME: 422,
  EMAIL_EXISTS: 400,
  SAME_PASSWORD: 400,
  INVALID_RESET_TOKEN: 400,
  INVALID_CREDENTIALS: 401,
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: 401,
  RATE_LIMIT_EXCEEDED: 429,
  SERVER_ERROR: 500,
  UNKNOWN_ERROR: 500,
  NETWORK_ERROR: 500,
}

export function authErrorResponse(code: AuthErrorCode): NextResponse<AuthErrorResponse> {
  return NextResponse.json({ error: errors.errors[code], code }, { status: STATUS_BY_CODE[code] })
}
