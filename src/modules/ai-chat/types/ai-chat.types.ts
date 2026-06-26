/** One operation the AI proposed that was individually skipped (partial success). */
export interface RejectedOperation {
  index: number
  reason: string
}

/**
 * The result of one AI instruction, as the chat UI needs to render it (FE-CHAT-3).
 *
 * Five outcomes per CLAUDE.md §9, confirmed against backend PR #48: two `200`
 * success shapes (full / partial) plus three error variants keyed off HTTP
 * status — 409 content-existence (carries `operation_index`/`expected_text`/
 * `actual_text`, forwarded intact by the GlobalExceptionFilter), 422 scope, and
 * 400 format. `rate-limited` (429) and `error` (anything uncategorized, e.g. a
 * 500 or a network failure) are non-fatal catch-alls.
 */
export type ChatOutcome =
  | { kind: 'applied'; operationsApplied: number }
  | { kind: 'partial'; operationsApplied: number; rejected: RejectedOperation[] }
  | {
      kind: 'content-conflict'
      message: string
      operationIndex?: number
      expectedText?: string
      actualText?: string
    }
  | { kind: 'scope'; message: string }
  | { kind: 'format'; message: string }
  | { kind: 'rate-limited'; message: string }
  | { kind: 'error'; message: string }

/** A single request/response exchange in the chat thread. */
export interface ChatTurn {
  id: string
  /** The author's instruction. */
  prompt: string
  status: 'pending' | 'done'
  /** Set once the request settles — success or failure. */
  outcome?: ChatOutcome
}
