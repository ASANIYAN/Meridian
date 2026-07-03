import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { LandingView } from '@/modules/marketing/views/landing'
import { useTokenRefresh } from '@/modules/auth/hooks/use-token-refresh'

/**
 * Gates document routes on auth + verified status (FE-STATE-5):
 * - no session        → /login
 * - session, unverified → /verify-pending (NOT the documents list)
 * The public /join/:token route is intentionally not wrapped by this guard.
 *
 * Also the single mount point for proactive token rotation (useTokenRefresh)
 * — every authenticated route lives under this component, so mounting it here
 * covers the whole session's lifetime rather than duplicating it per-route.
 */
export function RequireAuth() {
  const token = useAuthStore((s) => s.token)
  const isVerified = useAuthStore((s) => s.isVerified)
  useTokenRefresh()

  if (!token) return <Navigate to="/login" replace />
  if (!isVerified) return <Navigate to="/verify-pending" replace />

  return <Outlet />
}

/**
 * `/` — the marketing landing page for logged-out visitors. Anyone with an
 * active session is sent straight to `/documents` so returning users never
 * see the marketing page (mirrors RequireAuth's own token check above).
 */
export function HomeRoute() {
  const token = useAuthStore((s) => s.token)

  if (token) return <Navigate to="/documents" replace />

  return <LandingView />
}
