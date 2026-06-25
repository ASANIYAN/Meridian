import { useContext } from 'react'
import { CollaborationContext } from '../context/collaboration-context'

/**
 * Light hook (FE-COLLAB-7) — a plain read of the already-living connection. The
 * editor, presence indicator, connection-status indicator, and AI chat all use
 * this. None of them create anything.
 */
export function useCollaboration() {
  const ctx = useContext(CollaborationContext)
  if (!ctx) {
    throw new Error(
      'useCollaboration must be used inside a document route — its CollaborationContext.Provider is missing.',
    )
  }
  return ctx
}
