import type { User } from '@/types/user'

/** POST /auth/login success payload (unwrapped from the envelope). */
export interface LoginResponse {
  token: string
  user: User
}
