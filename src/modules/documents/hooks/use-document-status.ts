import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { useToastStore } from '@/store/toast-store'
import type { DocumentStatus } from '@/types/document'
import { updateDocumentStatus } from '../api/documents-api'
import { documentKey, documentsKey } from './use-documents'
import {
  patchDocumentCaches,
  restoreDocumentCaches,
  type DocumentCacheSnapshot,
} from './patch-document-caches'

/**
 * Author-only active/inactive toggle (FE-DOC-6) — optimistic for the same reason
 * as rename: reversible and low-consequence (CLAUDE.md §8). Author-gating is
 * enforced at the call site (the menu only renders for authors) and again by the
 * backend, which 403s a non-author.
 */
export function useDocumentStatus(id: string) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation<unknown, unknown, DocumentStatus, DocumentCacheSnapshot>({
    mutationFn: (status: DocumentStatus) => updateDocumentStatus(id, status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: documentKey(id) })
      await queryClient.cancelQueries({ queryKey: documentsKey })
      return patchDocumentCaches(queryClient, id, { status })
    },
    onError: (error, _status, snapshot) => {
      if (snapshot) restoreDocumentCaches(queryClient, id, snapshot)
      addToast({ message: getApiErrorMessage(error), variant: 'error' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentKey(id) })
      queryClient.invalidateQueries({ queryKey: documentsKey })
    },
  })
}
