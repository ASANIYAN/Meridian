import { createContext } from 'react'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import type { Role } from '@/types/document'
import type { ConnectionStatus, PresentUser } from '../types/collaboration.types'
import type { AiChatWsEvent } from '../types/ai-chat-ws.types'

/**
 * The live document state, scoped to the document route's subtree (CLAUDE.md §3).
 * Created once by useDocumentConnection and read by descendants via
 * useCollaboration — never created more than once per visit.
 */
export interface CollaborationContextValue {
  doc: Y.Doc
  /** Local Awareness — created but not synced; cursors are deferred (WS-6). */
  awareness: Awareness
  status: ConnectionStatus
  presentUsers: PresentUser[]
  role?: Role
  /** True once the first hydration completes; stays true across reconnects. */
  ready: boolean
  /**
   * Wait for the one `chat_result`/`proposal_result`/`ai_error` frame matching
   * `requestId` (CLAUDE.md §9) — fires `handler` once, then auto-unregisters.
   * Returns an unsubscribe function for early cleanup (e.g. a client-side
   * timeout winning the race). A stable function reference — registering a
   * waiter never causes Context consumers to re-render.
   */
  registerAiChatWaiter: (requestId: string, handler: (event: AiChatWsEvent) => void) => () => void
}

export const CollaborationContext = createContext<CollaborationContextValue | null>(null)
