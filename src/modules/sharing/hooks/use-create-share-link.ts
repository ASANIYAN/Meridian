import { useMutation } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { useToastStore } from '@/store/toast-store'
import { createShareLink } from '../api/sharing-api'
import type { GrantableRole } from '../types/sharing.types'

/**
 * Generate a share link (FE-SHARE-4). There is no endpoint to list links, so the
 * panel keeps created links in local state and feeds each result in via
 * `onCreated`. Errors surface as a toast.
 */
export function useCreateShareLink(documentId: string) {
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: (body: { role: GrantableRole; isSingleUse: boolean }) =>
      createShareLink(documentId, body),
    onError: (error) => addToast({ message: getApiErrorMessage(error), variant: 'error' }),
  })
}
