/** One operation the AI proposed that was individually skipped (partial success). */
export interface RejectedOperation {
  index: number
  reason: string
}

/**
 * The result of one AI instruction, as the chat UI needs to render it (FE-CHAT-3).
 *
 * Five outcomes per CLAUDE.md §9. Two are real today (the `200` success shapes);
 * the three error variants are keyed off HTTP status (409/422/400) and are
 * forward-compatible: the backend currently collapses all three into a generic
 * 500 (the AI domain errors aren't HttpExceptions yet, and the GlobalException-
 * Filter strips custom fields), so today they surface as `kind: 'error'`. Once
 * the backend maps those errors to 409/422/400, the matching branches light up
 * with no frontend change. `expectedText`/`actualText` are parsed only if they
 * ever survive the filter — never depended on.
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
