import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'

/**
 * Gates document routes on auth + verified status (FE-STATE-5):
 * - no session        → /login
 * - session, unverified → /verify-pending (NOT the documents list)
 * The public /join/:token route is intentionally not wrapped by this guard.
 */
export function RequireAuth() {
  const token = useAuthStore((s) => s.token)
  const isVerified = useAuthStore((s) => s.isVerified)

  if (!token) return <Navigate to="/login" replace />
  if (!isVerified) return <Navigate to="/verify-pending" replace />

  return <Outlet />
}
