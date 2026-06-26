import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { useToastStore } from '@/store/toast-store'
import { deleteDocument } from '../api/documents-api'
import { documentsKey } from './use-documents'

/**
 * Author-only soft delete (FE-DOC-5) — deliberately NOT optimistic (CLAUDE.md
 * §8). Delete is consequential, so the author waits for the server to confirm
 * before we leave the document; only then do we invalidate the list and navigate
 * back. The confirmation dialog lives in the component that calls this.
 */
export function useDeleteDocument(id: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: () => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKey })
      addToast({ message: 'Document deleted.', variant: 'success' })
      navigate('/documents', { replace: true })
    },
    onError: (error) => {
      addToast({ message: getApiErrorMessage(error), variant: 'error' })
    },
  })
}
