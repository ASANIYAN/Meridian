import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { DocumentDetail, DocumentSummary } from '@/types/document'
import { getDocument } from '../api/documents-api'
import { documentKey, documentsKey } from './use-documents'

/**
 * Single-document metadata for the editor header (FE-DOC-4/5/6). Seeds from the
 * list cache so a navigation from /documents renders the title instantly, while
 * still fetching to confirm role/status (and to cover deep-links, where the list
 * cache is empty).
 */
export function useDocument(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: documentKey(id),
    queryFn: () => getDocument(id),
    enabled: id !== '',
    placeholderData: () => {
      const list = queryClient.getQueryData<DocumentSummary[]>(documentsKey)
      return list?.find((d) => d.id === id) as DocumentDetail | undefined
    },
  })
}
