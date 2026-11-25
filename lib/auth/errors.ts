import type { AuthErrorCode } from '@/types'

interface SupabaseAuthErrorLike {
  code?: string
  status?: number
}

export function mapSupabaseAuthError(error: SupabaseAuthErrorLike): AuthErrorCode {
  switch (error.code) {
    case 'invalid_credentials':
      return 'INVALID_CREDENTIALS'
    case 'user_already_exists':
    case 'email_exists':
      return 'EMAIL_EXISTS'
    case 'weak_password':
      return 'WEAK_PASSWORD'
    case 'email_address_invalid':
      return 'INVALID_EMAIL'
    case 'same_password':
      return 'SAME_PASSWORD'
    case 'otp_expired':
    case 'flow_state_expired':
    case 'flow_state_not_found':
      return 'INVALID_RESET_TOKEN'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'RATE_LIMIT_EXCEEDED'
    case 'session_expired':
    case 'session_not_found':
    case 'refresh_token_not_found':
    case 'refresh_token_already_used':
      return 'SESSION_EXPIRED'
  }
  if (error.status === 429) return 'RATE_LIMIT_EXCEEDED'
  if (error.status !== undefined && error.status >= 500) return 'SERVER_ERROR'
  return 'UNKNOWN_ERROR'
}
