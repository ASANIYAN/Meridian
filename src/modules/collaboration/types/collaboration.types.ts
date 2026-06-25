/** Connection lifecycle the indicator and gating react to. */
export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'error'

/** A user currently present in the document (presence roster, CLAUDE.md §4). */
export interface PresentUser {
  userId: string
  displayName: string
}
