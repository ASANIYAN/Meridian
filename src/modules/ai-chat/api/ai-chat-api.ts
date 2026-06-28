import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'
import type { AiEditDiff, RejectedOperation } from '../types/ai-chat.types'

/**
 * The `200` chat response body (snake_case, like the rest of the AI/WS surface).
 * `rejected_operations` is present only on a partial success.
 */
export interface ChatSuccess {
  operations_applied: number
  rejected_operations?: RejectedOperation[]
}

/** The staged edit returned by POST /documents/:id/chat/propose. */
export interface ChatProposal {
  proposalId: string
  diff: AiEditDiff
  expiresAt: string
}

/**
 * POST /documents/:id/chat — author-only (FE-CHAT-2). The actual document edit
 * arrives via the Yjs broadcast (CLAUDE.md §4), not this response; the body only
 * reports how many operations were applied (and which were skipped).
 */
export async function sendChatMessage(documentId: string, message: string): Promise<ChatSuccess> {
  const res = await apiClient.post<ApiEnvelope<ChatSuccess>>(`/documents/${documentId}/chat`, {
    message,
  })
  return unwrap(res)
}

/**
 * POST /documents/:id/chat/propose — runs the AI edit pipeline but stages the
 * validated edit in Redis so the author can review it before the document changes.
 */
export async function proposeChatEdit(documentId: string, message: string): Promise<ChatProposal> {
  const res = await apiClient.post<ApiEnvelope<ChatProposal>>(
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
