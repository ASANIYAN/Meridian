import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'
import type { RejectedOperation } from '../types/ai-chat.types'

/**
 * The `200` chat response body (snake_case, like the rest of the AI/WS surface).
 * `rejected_operations` is present only on a partial success.
 */
export interface ChatSuccess {
  operations_applied: number
  rejected_operations?: RejectedOperation[]
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
