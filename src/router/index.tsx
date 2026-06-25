import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginView } from '@/modules/auth/views/login'
import { SignupView } from '@/modules/auth/views/signup'
import { VerifyEmailView } from '@/modules/auth/views/verify-email'
import { ForgotPasswordView } from '@/modules/auth/views/forgot-password'
import { ResetPasswordView } from '@/modules/auth/views/reset-password'
import { ResendVerificationView } from '@/modules/auth/views/resend-verification'
import { ClaimView } from '@/modules/join/views/claim'
import { AppShellPreview } from '@/dev/app-shell-preview'

/**
 * Auth + public-claim routes. The authenticated shell (/documents,
 * /documents/:id) and the route guard land with the app shell + state epics
 * (FE-SETUP-6, FE-STATE-5).
 */
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginView /> },
  { path: '/signup', element: <SignupView /> },
  { path: '/verify-email', element: <VerifyEmailView /> },
  { path: '/forgot-password', element: <ForgotPasswordView /> },
  { path: '/reset-password', element: <ResetPasswordView /> },
  { path: '/resend-verification', element: <ResendVerificationView /> },
  { path: '/join/:token', element: <ClaimView /> },
  { path: '/preview/app', element: <AppShellPreview /> },
])
