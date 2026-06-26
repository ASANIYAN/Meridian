import { useMutation } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { useToastStore } from '@/store/toast-store'
import { revokeShareLink } from '../api/sharing-api'

/**
 * Revoke a share link (FE-SHARE-4) — non-optimistic, per CLAUDE.md §8: the author
 * needs certainty the link is actually dead before walking away, so the row is
 * only marked revoked once the server confirms (via `onRevoked`).
 */
export function useRevokeShareLink(documentId: string) {
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (token: string) => revokeShareLink(documentId, token),
    onSuccess: () => addToast({ message: 'Link revoked.', variant: 'success' }),
    onError: (error) => addToast({ message: getApiErrorMessage(error), variant: 'error' }),
  })
}
