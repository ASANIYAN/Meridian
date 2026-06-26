import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'
import type { LoginResponse, VerifyEmailResponse } from '../types/auth.types'
import type { LoginValues, SignupValues } from '../utils/schemas'

/**
 * Auth endpoints under the /v1 prefix (added by apiClient). Field casing and the
 * exact payloads here are the confirmed contracts from CLAUDE.md §7/§11 — note
 * login returns only { token }, verify-email/reset-password both require `email`
 * alongside the token, and reset uses camelCase `newPassword`.
 */

export async function login(values: LoginValues): Promise<LoginResponse> {
  const res = await apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', values)
  return unwrap(res)
}

export async function signup(values: SignupValues): Promise<void> {
  await apiClient.post('/auth/signup', values)
}

/** POST /auth/verify-email — requires { email, token }; already-verified is a 200. */
export async function verifyEmail(email: string, token: string): Promise<VerifyEmailResponse> {
  const res = await apiClient.post<ApiEnvelope<VerifyEmailResponse>>('/auth/verify-email', {
    email,
    token,
  })
  return unwrap(res)
}

/** Confirmed path is /auth/resend-verification-email (not /resend-verification). */
export async function resendVerification(email: string): Promise<void> {
  await apiClient.post('/auth/resend-verification-email', { email })
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

/** POST /auth/reset-password — requires { email, token, newPassword } (camelCase). */
export async function resetPassword(payload: {
  email: string
  token: string
  newPassword: string
}): Promise<void> {
  await apiClient.post('/auth/reset-password', payload)
}
