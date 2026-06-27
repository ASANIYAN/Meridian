import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { useToastStore } from '@/store/toast-store'

/**
 * The single sign-out path: clear the session, confirm with a toast, and land on
 * /login. Previously this was duplicated inline across three views; centralizing
 * it keeps the behavior (and the confirmation toast) consistent everywhere. The
 * Toaster is mounted above the router, so the toast survives the navigation.
 */
export function useSignOut() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((s) => s.clearSession)
  const addToast = useToastStore((s) => s.addToast)

  return useCallback(() => {
    clearSession()
    addToast({ message: 'Signed out.', variant: 'default' })
    navigate('/login', { replace: true })
  }, [clearSession, addToast, navigate])
}
