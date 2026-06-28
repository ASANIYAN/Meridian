/** One operation the AI proposed that was individually skipped (partial success). */
export interface RejectedOperation {
  index: number
  reason: string
}

/** The before/after text preview returned by staged AI edit endpoints. */
export interface AiEditDiff {
  before: string
  after: string
}

/**
 * The result of one AI instruction, as the chat UI needs to render it (FE-CHAT-3).
 *
 * Includes staged proposal states, accept/decline results, and the non-fatal
 * error outcomes the chat surface can recover from inline.
 */
export type ChatOutcome =
  | { kind: 'proposal'; proposalId: string; diff: AiEditDiff; expiresAt: string }
  | { kind: 'declined'; message: string }
  | { kind: 'applied'; operationsApplied: number }
  | { kind: 'partial'; operationsApplied: number; rejected: RejectedOperation[] }
  | {
      kind: 'proposal-conflict'
      proposalId: string
      message: string
      diff?: AiEditDiff
      operationIndex?: number
      expectedText?: string
      actualText?: string
    }
  | {
      kind: 'content-conflict'
      message: string
      operationIndex?: number
      expectedText?: string
      actualText?: string
    }
  | { kind: 'scope'; message: string }
  | { kind: 'format'; message: string }
  | { kind: 'gone'; message: string }
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
  action?: 'accepting' | 'declining'
}
