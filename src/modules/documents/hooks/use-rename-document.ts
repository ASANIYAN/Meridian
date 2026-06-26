import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { useToastStore } from '@/store/toast-store'
import { updateDocumentTitle } from '../api/documents-api'
import { documentKey, documentsKey } from './use-documents'
import {
  patchDocumentCaches,
  restoreDocumentCaches,
  type DocumentCacheSnapshot,
} from './patch-document-caches'

/**
 * Inline title rename (FE-DOC-4) — optimistic, because it's trivially reversible
 * and low-consequence (CLAUDE.md §8). The new title shows immediately in the
 * header and the list; a failure rolls both back and surfaces a toast.
 */
export function useRenameDocument(id: string) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation<unknown, unknown, string, DocumentCacheSnapshot>({
    mutationFn: (title: string) => updateDocumentTitle(id, title),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: documentKey(id) })
      await queryClient.cancelQueries({ queryKey: documentsKey })
      return patchDocumentCaches(queryClient, id, { title })
    },
    onError: (error, _title, snapshot) => {
      if (snapshot) restoreDocumentCaches(queryClient, id, snapshot)
      addToast({ message: getApiErrorMessage(error), variant: 'error' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentKey(id) })
      queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}
