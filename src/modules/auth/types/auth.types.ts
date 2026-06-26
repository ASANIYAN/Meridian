import type { User } from '@/types/user'

/**
 * POST /auth/login returns only the token (CLAUDE.md §11) — no user object. The
 * user's id/email are decoded from the JWT; first/last name and verifiedAt have
 * no confirmed source after login (an open backend gap).
 */
export interface LoginResponse {
  token: string
}

/** POST /auth/verify-email — 200 with the user, plus a flag if already verified. */
export interface VerifyEmailResponse {
  user?: User
  alreadyVerified?: boolean
}
