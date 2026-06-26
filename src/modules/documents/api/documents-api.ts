import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'
import type { DocumentDetail, DocumentStatus, DocumentSummary } from '@/types/document'

/** GET /documents — every document the current user has a membership on. */
export async function getDocuments(): Promise<DocumentSummary[]> {
  const res = await apiClient.get<ApiEnvelope<DocumentSummary[]>>('/documents')
  return unwrap(res)
}

/** GET /documents/:id — metadata + the caller's role for a single document. */
export async function getDocument(id: string): Promise<DocumentDetail> {
  const res = await apiClient.get<ApiEnvelope<DocumentDetail>>(`/documents/${id}`)
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

/**
 * PATCH /documents/:id — rename (FE-DOC-4). Authors and editors may rename;
 * viewers get 403. Content changes never go through here — they're WS-only.
 */
export async function updateDocumentTitle(id: string, title: string): Promise<DocumentDetail> {
  const res = await apiClient.patch<ApiEnvelope<DocumentDetail>>(`/documents/${id}`, { title })
  return unwrap(res)
}

/** PATCH /documents/:id/status — author-only active/inactive toggle (FE-DOC-6). */
export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
): Promise<DocumentDetail> {
  const res = await apiClient.patch<ApiEnvelope<DocumentDetail>>(`/documents/${id}/status`, {
    status,
  })
  return unwrap(res)
}

/** DELETE /documents/:id — author-only soft delete (FE-DOC-5); 204, no body. */
export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`)
}
