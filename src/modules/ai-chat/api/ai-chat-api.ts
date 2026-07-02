import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'
import type { AiEditDiff, RejectedOperation } from '../types/ai-chat.types'

/**
 * The `200` chat response body (snake_case, like the rest of the AI/WS surface).
 * `rejected_operations` is present only on a partial success. Still the shape of
 * the `chat_result` WS frame's payload — just no longer what this endpoint itself
 * returns (see ChatAccepted below).
 */
export interface ChatSuccess {
  operations_applied: number
  rejected_operations?: RejectedOperation[]
}

/** The staged edit returned by POST /documents/:id/chat/propose. Still the shape
 *  of the `proposal_result` WS frame's payload (see ChatAccepted below). */
export interface ChatProposal {
  proposalId: string
  diff: AiEditDiff
  expiresAt: string
}

/** The `202` body both `/chat` and `/chat/propose` now return (CLAUDE.md §9) —
 *  the pipeline runs as a background job; the real outcome (ChatSuccess or
 *  ChatProposal, or an error) arrives later as a WS frame matching `requestId`. */
export interface ChatAccepted {
  requestId: string
}

/**
 * POST /documents/:id/chat — author-only (FE-CHAT-2). Returns immediately with a
 * `requestId`; the actual result arrives as a `chat_result`/`ai_error` frame on
 * the document's existing WS connection (CLAUDE.md §9), not in this response.
 */
export async function sendChatMessage(documentId: string, message: string): Promise<ChatAccepted> {
  const res = await apiClient.post<ApiEnvelope<ChatAccepted>>(`/documents/${documentId}/chat`, {
    message,
  })
  return unwrap(res)
}

/**
 * POST /documents/:id/chat/propose — runs the AI edit pipeline but stages the
 * validated edit in Redis so the author can review it before the document
 * changes. Returns immediately with a `requestId`; the staged proposal (or an
 * error) arrives as a `proposal_result`/`ai_error` WS frame (CLAUDE.md §9).
 */
export async function proposeChatEdit(documentId: string, message: string): Promise<ChatAccepted> {
  const res = await apiClient.post<ApiEnvelope<ChatAccepted>>(
    `/documents/${documentId}/chat/propose`,
    { message },
  )
  return unwrap(res)
}

/**
 * POST /documents/:id/chat/proposals/:proposalId/accept — applies a staged
 * proposal through the same document operation pipeline as immediate chat edits.
 */
export async function acceptChatProposal(
  documentId: string,
  proposalId: string,
  confirm = false,
): Promise<ChatSuccess> {
  const res = await apiClient.post<ApiEnvelope<ChatSuccess>>(
    `/documents/${documentId}/chat/proposals/${proposalId}/accept`,
    { confirm },
  )
  return unwrap(res)
}

/** DELETE /documents/:id/chat/proposals/:proposalId — discards a staged proposal. */
export async function declineChatProposal(documentId: string, proposalId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}/chat/proposals/${proposalId}`)
}
