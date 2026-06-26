import type { QueryClient } from '@tanstack/react-query'
import type { DocumentDetail, DocumentSummary } from '@/types/document'
import { documentKey, documentsKey } from './use-documents'

/** A snapshot of both document caches, returned for optimistic rollback. */
export interface DocumentCacheSnapshot {
  detail: DocumentDetail | undefined
  list: DocumentSummary[] | undefined
}

/**
 * Optimistically apply `patch` to a single document in both the detail cache
 * (`['documents', id]`) and the list cache (`['documents']`), returning the
 * prior values so an `onError` handler can restore them (CLAUDE.md §8).
 */
export function patchDocumentCaches(
  queryClient: QueryClient,
  id: string,
  patch: Partial<Pick<DocumentDetail, 'title' | 'status'>>,
): DocumentCacheSnapshot {
  const detail = queryClient.getQueryData<DocumentDetail>(documentKey(id))
  const list = queryClient.getQueryData<DocumentSummary[]>(documentsKey)

  queryClient.setQueryData<DocumentDetail>(documentKey(id), (prev) =>
    prev ? { ...prev, ...patch } : prev,
  )
  queryClient.setQueryData<DocumentSummary[]>(documentsKey, (prev) =>
    prev?.map((d) => (d.id === id ? { ...d, ...patch } : d)),
  )

  return { detail, list }
}

/** Restore both caches from a snapshot taken before an optimistic update. */
export function restoreDocumentCaches(
  queryClient: QueryClient,
  id: string,
  snapshot: DocumentCacheSnapshot,
) {
  queryClient.setQueryData(documentKey(id), snapshot.detail)
  queryClient.setQueryData(documentsKey, snapshot.list)
}
