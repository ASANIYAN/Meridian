import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { useToastStore } from '@/store/toast-store'
import { removeMember } from '../api/sharing-api'
import { membersKey } from './use-members'

/**
 * Remove a member (FE-SHARE-2) — non-optimistic. Revoking someone's access is
 * consequential enough to wait for the server before the row disappears (the
 * row's own inline confirm guards the click); on success the list is invalidated.
 */
export function useRemoveMember(documentId: string) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (userId: string) => removeMember(documentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey(documentId) })
      addToast({ message: 'Member removed.', variant: 'success' })
    },
    onError: (error) => addToast({ message: getApiErrorMessage(error), variant: 'error' }),
  })
}
