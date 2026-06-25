import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'
import type { DocumentSummary } from '@/types/document'

/** GET /documents — every document the current user has a membership on. */
export async function getDocuments(): Promise<DocumentSummary[]> {
  const res = await apiClient.get<ApiEnvelope<DocumentSummary[]>>('/documents')
  return unwrap(res)
}

/**
 * POST /documents — creates the document and an author membership row atomically;
 * the frontend just invalidates the list and navigates in (CLAUDE.md §8).
 */
export async function createDocument(title: string): Promise<DocumentSummary> {
  const res = await apiClient.post<ApiEnvelope<DocumentSummary>>('/documents', { title })
  return unwrap(res)
}
