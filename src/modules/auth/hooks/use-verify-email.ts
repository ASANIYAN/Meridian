import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/auth-api'

export type VerifyStatus = 'pending' | 'success' | 'already-verified' | 'error'

/**
 * Verify-email (FE-AUTH-3). The emailed link carries both `email` and `token` as
 * query params; the endpoint requires both (CLAUDE.md §7). Fires once on mount.
 * Already-verified is a 200 with `alreadyVerified: true` — surfaced as its own
 * state, not the generic failure. Any real failure collapses to a generic error.
 *
 * Deliberately not `useMutation` here: its result is read through a
 * `useSyncExternalStore` subscription that, under React 19 Strict Mode's
 * double-effect pass, can miss the notification for a `mutate()` call fired
 * from the same effect that gets torn down and replaced (confirmed by tracing
 * through `MutationObserver`/`notifyManager` — the store update lands, but the
 * component tied to it never re-renders). A plain `useState` set from a
 * `.then()`/`.catch()` has no such subscription-timing hazard.
 */
export function useVerifyEmail(): { status: VerifyStatus } {
  const [params] = useSearchParams()
  const email = params.get('email')
  const token = params.get('token')
  const fired = useRef(false)
  const [status, setStatus] = useState<VerifyStatus>(() => (!email || !token ? 'error' : 'pending'))

  useEffect(() => {
    if (fired.current || !email || !token) return
    fired.current = true
    verifyEmail(email, token)
      .then((data) => setStatus(data.alreadyVerified ? 'already-verified' : 'success'))
      .catch(() => setStatus('error'))
    // Fire exactly once for the email + token present at mount.
  }, [email, token])

  return { status }
}
