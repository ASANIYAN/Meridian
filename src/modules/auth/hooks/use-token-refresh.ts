import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { getJwtExpiryMs } from '@/lib/jwt'
import { refreshToken } from '../api/auth-api'

// Poll rather than compute one precisely-timed timer for the token's whole
// lifetime — cheap, and resilient to laptop sleep/clock drift shifting when
// "close to expiry" actually lands.
const POLL_INTERVAL_MS = 60_000
const EXPIRY_WINDOW_MS = 120_000

/**
 * Proactively rotates the access token before it expires (the token/session
 * rotation gap flagged against CLAUDE.md §11). Mounted once at RequireAuth, so
 * it runs for the lifetime of any authenticated session regardless of route —
 * including while a document's WebSocket is open, since MeridianProvider reads
 * the store's token live on every (re)connect rather than a value captured at
 * construction (see useDocumentConnection).
 *
 * A 401 from the refresh call itself (missing/expired/revoked JWT) is already
 * handled by the shared apiClient response interceptor, which clears the
 * session and redirects to /login — this hook doesn't duplicate that logic,
 * it just lets the failure surface.
 */
export function useTokenRefresh() {
  const token = useAuthStore((s) => s.token)
  const rotateToken = useAuthStore((s) => s.rotateToken)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!token) return

    const check = async () => {
      if (inFlight.current) return
      const expiry = getJwtExpiryMs(token)
      if (expiry == null || expiry - Date.now() > EXPIRY_WINDOW_MS) return

      inFlight.current = true
      try {
        const next = await refreshToken()
        rotateToken(next.token)
      } catch {
        // Genuine auth failure already triggers logout via the apiClient
        // interceptor; anything else (a network blip) is retried next tick.
      } finally {
        inFlight.current = false
      }
    }

    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [token, rotateToken])
}
