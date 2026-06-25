import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'
import type { LoginResponse } from '../types/auth.types'
import type { LoginValues, SignupValues } from '../utils/schemas'

/**
 * Auth endpoints under the /v1 prefix (added by apiClient). Field casing follows
 * the backend's camelCase REST DTOs, except reset-password's `new_password`,
 * which the contract specifies in snake_case (CLAUDE.md §2, backlog FE-AUTH-6).
 */

export async function login(values: LoginValues): Promise<LoginResponse> {
  const res = await apiClient.post<ApiEnvelope<LoginResponse>>('/auth/login', values)
  return unwrap(res)
}

export async function signup(values: SignupValues): Promise<void> {
  await apiClient.post('/auth/signup', values)
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post('/auth/verify-email', { token })
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post('/auth/resend-verification', { email })
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

export async function resetPassword(payload: {
  token: string
  new_password: string
}): Promise<void> {
  await apiClient.post('/auth/reset-password', payload)
}
