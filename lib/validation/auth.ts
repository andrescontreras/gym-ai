import { z } from 'zod'
import type {
  AuthErrorCode,
  LoginRequest,
  ResetPasswordConfirmRequest,
  ResetPasswordRequest,
  SignupRequest,
} from '@/types'

export const authErrorCodes = [
  'INVALID_CREDENTIALS',
  'EMAIL_EXISTS',
  'WEAK_PASSWORD',
  'INVALID_EMAIL',
  'PASSWORDS_DONT_MATCH',
  'INVALID_NAME',
  'SAME_PASSWORD',
  'INVALID_RESET_TOKEN',
  'RATE_LIMIT_EXCEEDED',
  'SESSION_EXPIRED',
  'UNAUTHORIZED',
  'NETWORK_ERROR',
  'SERVER_ERROR',
  'UNKNOWN_ERROR',
] as const satisfies readonly AuthErrorCode[]

export const emailSchema = z
  .string({ error: 'INVALID_EMAIL' })
  .trim()
  .toLowerCase()
  .max(255, 'INVALID_EMAIL')
  .pipe(z.email('INVALID_EMAIL'))

export const passwordSchema = z
  .string({ error: 'WEAK_PASSWORD' })
  .min(8, 'WEAK_PASSWORD')
  .max(72, 'WEAK_PASSWORD')
  .regex(/[A-Z]/, 'WEAK_PASSWORD')
  .regex(/[a-z]/, 'WEAK_PASSWORD')
  .regex(/\d/, 'WEAK_PASSWORD')

export const nameSchema = z
  .string({ error: 'INVALID_NAME' })
  .trim()
  .min(2, 'INVALID_NAME')
  .max(50, 'INVALID_NAME')
  .regex(/^\p{L}[\p{L} '\-]*$/u, 'INVALID_NAME')
  .optional()

export const signupRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
}) satisfies z.ZodType<SignupRequest>

export const signupFormSchema = signupRequestSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'PASSWORDS_DONT_MATCH',
    path: ['confirmPassword'],
  })

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'INVALID_CREDENTIALS' }).min(1, 'INVALID_CREDENTIALS'),
}) satisfies z.ZodType<LoginRequest>

export const resetRequestSchema = z.object({
  email: emailSchema,
}) satisfies z.ZodType<ResetPasswordRequest>

export const resetConfirmRequestSchema = z.object({
  password: passwordSchema,
}) satisfies z.ZodType<ResetPasswordConfirmRequest>

export const resetConfirmFormSchema = resetConfirmRequestSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'PASSWORDS_DONT_MATCH',
    path: ['confirmPassword'],
  })

function isAuthErrorCode(value: string): value is AuthErrorCode {
  return authErrorCodes.some((code) => code === value)
}

export function getIssueCode(error: z.ZodError): AuthErrorCode {
  const message = error.issues[0]?.message
  return message !== undefined && isAuthErrorCode(message) ? message : 'UNKNOWN_ERROR'
}
