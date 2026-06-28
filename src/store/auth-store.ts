import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User } from '@/types/user'
import { authCookieStorage } from './auth-cookie-storage'

interface AuthState {
  user: User | null
  token: string | null
  isVerified: boolean
  setSession: (session: { user: User; token: string }) => void
  clearSession: () => void
}

type AuthBroadcast = { type: 'session'; user: User; token: string } | { type: 'clear' }

const authChannel =
  typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('meridian-auth')

/**
 * Session/auth — the one legitimate general-purpose Zustand store (CLAUDE.md §3).
 * Read from far-apart places (header, route guards, AI-chat gating, role checks)
 * and lives for the whole app session. Persisted so a refresh keeps the session;
 * the backend's JWT/blacklist model is the real authority, and a 401 anywhere
 * clears this store (see the API client's response interceptor).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      authChannel?.addEventListener('message', (event: MessageEvent<AuthBroadcast>) => {
        if (event.data.type === 'session') {
          set({
            user: event.data.user,
            token: event.data.token,
            isVerified: event.data.user.verifiedAt !== null,
          })
        } else {
          set({ user: null, token: null, isVerified: false })
        }
      })

      return {
        user: null,
        token: null,
        isVerified: false,
        setSession: ({ user, token }) => {
          set({ user, token, isVerified: user.verifiedAt !== null })
          authChannel?.postMessage({ type: 'session', user, token } satisfies AuthBroadcast)
        },
        clearSession: () => {
          set({ user: null, token: null, isVerified: false })
          authChannel?.postMessage({ type: 'clear' } satisfies AuthBroadcast)
        },
      }
    },
    {
      name: 'meridian-auth',
      storage: createJSONStorage(() => authCookieStorage),
    },
  ),
)
