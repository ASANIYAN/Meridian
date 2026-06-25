import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginView } from '@/modules/auth/views/login'
import { SignupView } from '@/modules/auth/views/signup'
import { VerifyEmailView } from '@/modules/auth/views/verify-email'
import { VerifyPendingView } from '@/modules/auth/views/verify-pending'
import { ForgotPasswordView } from '@/modules/auth/views/forgot-password'
import { ResetPasswordView } from '@/modules/auth/views/reset-password'
import { ResendVerificationView } from '@/modules/auth/views/resend-verification'
import { ClaimView } from '@/modules/join/views/claim'
import { DocumentsView } from '@/modules/documents/views/documents'
import { DocumentRoute } from '@/modules/collaboration/views/document-route'
import { RequireAuth } from './require-auth'
import { AppShellPreview } from '@/dev/app-shell-preview'

/**
 * Public auth + claim routes, plus the guarded app routes (RequireAuth, §FE-STATE-5).
 * The document editor (/documents/:id) lands with the collaboration epic.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/documents" replace /> },

  // Public
  { path: '/login', element: <LoginView /> },
  { path: '/signup', element: <SignupView /> },
  { path: '/verify-email', element: <VerifyEmailView /> },
  { path: '/verify-pending', element: <VerifyPendingView /> },
  { path: '/forgot-password', element: <ForgotPasswordView /> },
  { path: '/reset-password', element: <ResetPasswordView /> },
  { path: '/resend-verification', element: <ResendVerificationView /> },
  { path: '/join/:token', element: <ClaimView /> },

  // Guarded
  {
    element: <RequireAuth />,
    children: [
      { path: '/documents', element: <DocumentsView /> },
      { path: '/documents/:id', element: <DocumentRoute /> },
    ],
  },

  { path: '/preview/app', element: <AppShellPreview /> },
])
