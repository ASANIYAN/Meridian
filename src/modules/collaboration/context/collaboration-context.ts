import { createContext } from 'react'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import type { Role } from '@/types/document'
import type { ConnectionStatus, PresentUser } from '../types/collaboration.types'

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
}

export const CollaborationContext = createContext<CollaborationContextValue | null>(null)
