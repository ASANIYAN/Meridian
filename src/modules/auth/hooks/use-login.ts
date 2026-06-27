import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { sanitizeRedirect } from '@/lib/redirect'
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api/get-api-error-message'
import { decodeJwt } from '@/lib/jwt'
import type { User } from '@/types/user'
import { login } from '../api/auth-api'
import { loginSchema, type LoginValues } from '../utils/schemas'

interface JwtClaims {
  sub?: string
  user_id?: string
  userId?: string
  email?: string
  firstName?: string
  lastName?: string
  verifiedAt?: string | null
}

/**
 * Build the session user from the login token's claims. Login returns only a
 * token (CLAUDE.md §11): id/email come from the JWT; first/last name aren't
 * confirmed claims (fullName falls back to email). Login only succeeds for
 * verified accounts (unverified → 403), so the session is treated as verified.
 */
function userFromToken(token: string, fallbackEmail: string): User {
  const c = decodeJwt<JwtClaims>(token)
  return {
    id: String(c?.sub ?? c?.user_id ?? c?.userId ?? ''),
    email: String(c?.email ?? fallbackEmail),
    firstName: c?.firstName ?? '',
    lastName: c?.lastName ?? '',
    verifiedAt: c?.verifiedAt ?? new Date().toISOString(),
  }
}

/**
 * Login (FE-AUTH-2). On success, stores the session and lands on /documents.
 * The unverified-account 403 carries the backend's *specific* message (which
 * differs by whether a fresh link was just sent) and is surfaced verbatim with
 * a resend path — distinct from the invalid-credentials 401, which shows one
 * generic message that never reveals whether the email exists.
 */
export function useLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const [unverifiedMessage, setUnverifiedMessage] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token }, variables) => {
      setSession({ user: userFromToken(token, variables.email), token })
      // Honor a sanitized ?redirect= (e.g. returning to a share-link claim,
      // FE-SHARE-5); otherwise land on the documents list.
      const redirect = sanitizeRedirect(searchParams.get('redirect'))
      navigate(redirect ?? '/documents', { replace: true })
    },
    onError: (error) => {
      const status = getApiErrorStatus(error)
      if (status === 403) {
        setUnverifiedMessage(getApiErrorMessage(error))
      } else {
        form.setError('root', { message: 'Email or password is incorrect.' })
      }
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setUnverifiedMessage(null)
    form.clearErrors('root')
    mutation.mutate(values)
  })

  return { form, onSubmit, isPending: mutation.isPending, unverifiedMessage }
}
