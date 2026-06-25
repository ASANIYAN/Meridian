import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginView } from '@/modules/auth/views/login'

/**
 * Minimal router for the auth foundation. The full route skeleton
 * (signup, verify-email, forgot/reset, /join/:token, /documents, /documents/:id
 * with the authenticated vs unauthenticated shells) is FE-SETUP-6.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginView /> },
])
