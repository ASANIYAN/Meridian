import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { verifyEmail } from '../api/auth-api'

export type VerifyStatus = 'pending' | 'success' | 'already-verified' | 'error'

/**
 * Verify-email (FE-AUTH-3). The emailed link carries both `email` and `token` as
 * query params; the endpoint requires both (CLAUDE.md §7). Fires once on mount.
 * Already-verified is a 200 with `alreadyVerified: true` — surfaced as its own
 * state, not the generic failure. Any real failure collapses to a generic error.
 */
export function useVerifyEmail(): { status: VerifyStatus } {
  const [params] = useSearchParams()
  const email = params.get('email')
  const token = params.get('token')
  const fired = useRef(false)

  const mutation = useMutation({
    mutationFn: () => verifyEmail(email ?? '', token ?? ''),
  })

  useEffect(() => {
    if (fired.current || !email || !token) return
    fired.current = true
    mutation.mutate()
    // Fire exactly once for the email + token present at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, token])

  const status: VerifyStatus =
    !email || !token
      ? 'error'
      : mutation.isSuccess
        ? mutation.data?.alreadyVerified
          ? 'already-verified'
          : 'success'
        : mutation.isError
          ? 'error'
          : 'pending'

  return { status }
}
