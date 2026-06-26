import { useQuery } from '@tanstack/react-query'
import { getDocuments } from '../api/documents-api'

export const documentsKey = ['documents'] as const

/** Query key for a single document's metadata — a child of the list key. */
export const documentKey = (id: string) => ['documents', id] as const

/** The list of documents the current user has access to (FE-DOC-1). */
export function useDocuments() {
  return useQuery({
    queryKey: documentsKey,
    queryFn: getDocuments,
  })
}
