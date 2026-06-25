import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isVerified: boolean
  setSession: (session: { user: User; token: string }) => void
  clearSession: () => void
}

/**
 * Session/auth — the one legitimate general-purpose Zustand store (CLAUDE.md §3).
 * Read from far-apart places (header, route guards, AI-chat gating, role checks)
 * and lives for the whole app session. Persisted so a refresh keeps the session;
 * the backend's JWT/blacklist model is the real authority, and a 401 anywhere
 * clears this store (see the API client's response interceptor).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isVerified: false,
      setSession: ({ user, token }) =>
        set({ user, token, isVerified: user.verifiedAt !== null }),
      clearSession: () => set({ user: null, token: null, isVerified: false }),
    }),
    { name: 'meridian-auth' },
  ),
)
