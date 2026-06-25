/**
 * Close-code classification (FE-COLLAB-5, CLAUDE.md §9).
 *
 * Close codes are overloaded — 4001 means two unrelated things — so we branch on
 * the reason string, not the numeric code alone. Connection-level failures are
 * owned here; ack/rate-limit are message-level and handled in the provider's
 * dispatcher.
 */

export type CloseAction =
  /** Hard auth failure — re-authenticate. Do not retry with the same token. */
  | { kind: 'redirect-login'; message: string }
  /** Authenticated but no membership on this document. */
  | { kind: 'redirect-documents'; message: string }
  /** Throttled or transient server fault — back off and reconnect. */
  | { kind: 'retry'; message: string }
  /** Programmer-error invariant (a malformed join). Never a login redirect. */
  | { kind: 'fatal'; message: string }
  /** Clean close (normal navigation away) — no action. */
  | { kind: 'closed'; message: string }

export function classifyClose(code: number, reason: string): CloseAction {
  const r = reason ?? ''

  switch (code) {
    case 1000:
    case 1001:
      return { kind: 'closed', message: 'Connection closed.' }

    case 4001:
      // Overloaded: auth failure vs a client-side protocol bug.
      if (r.includes('No document id found')) {
        return { kind: 'fatal', message: 'Something went wrong opening this document.' }
      }
      return { kind: 'redirect-login', message: 'Your session has expired. Please sign in again.' }

    case 4003:
      return { kind: 'redirect-documents', message: "You don't have access to this document." }

    case 4029:
      return { kind: 'retry', message: 'Too many requests — reconnecting…' }

    case 1011:
      return { kind: 'retry', message: 'The server hit a snag — reconnecting…' }

    default:
      // Unknown abnormal close — attempt to recover rather than dead-end.
      return { kind: 'retry', message: 'Connection lost — reconnecting…' }
  }
}
