import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { verifyEmail } from '../api/auth-api'

export type VerifyStatus = 'pending' | 'success' | 'error'

/**
 * Verify-email (FE-AUTH-3). Reads the token from the URL, fires the mutation
 * once on mount, and reduces to three states. Any failure — expired, already
 * verified, invalid, or missing token — collapses to a single generic error,
 * leaking nothing about why.
 */
export function useVerifyEmail(): { status: VerifyStatus } {
  const [params] = useSearchParams()
  const token = params.get('token')
  const fired = useRef(false)
  const mutation = useMutation({ mutationFn: verifyEmail })

  useEffect(() => {
    if (fired.current || !token) return
    fired.current = true
    mutation.mutate(token)
    // Fire exactly once for the token present at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const status: VerifyStatus = !token
    ? 'error'
    : mutation.isSuccess
      ? 'success'
      : mutation.isError
        ? 'error'
        : 'pending'

  return { status }
}
