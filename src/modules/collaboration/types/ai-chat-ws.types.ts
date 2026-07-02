/**
 * AI chat's async result frames (CLAUDE.md §4/§9) — a document's WS connection now
 * also carries these, keyed by `requestId` back to a `POST /:id/chat[/propose]` 202
 * response. Unlike `initial_state`/`ack`/`rate_limit_warning`, these are FLAT:
 * `requestId` and the payload fields sit directly alongside `event`, not nested
 * under a `data` key. Don't reach for `frame.data` here — there isn't one.
 */

export interface ChatResultWsData {
  requestId: string
  operations_applied: number
  rejected_operations?: { index: number; reason: string }[]
}

export interface ProposalResultWsData {
  requestId: string
  proposalId: string
  diff: { before: string; after: string }
  expiresAt: string
}

export interface AiErrorWsData {
  requestId: string
  /** Mirrors what the endpoint used to return synchronously (400/409/422), plus
   *  two cases only possible now that the pipeline runs as a background job:
   *  504 (server-side job timeout, ~120s) and 500 (worker crashed mid-job). */
  status: number
  message: string
  check?: 'content_existence' | 'scope'
  operation_index?: number
  expected_text?: string
  actual_text?: string
}

export type AiChatWsEvent =
  | { event: 'chat_result'; data: ChatResultWsData }
  | { event: 'proposal_result'; data: ProposalResultWsData }
  | { event: 'ai_error'; data: AiErrorWsData }
