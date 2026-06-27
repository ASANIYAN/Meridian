import { useCollaboration } from '../hooks/use-collaboration'
import { DocumentEditor } from './document-editor'

/**
 * The editing surface for the open document. Gates on `ready` so the Tiptap
 * editor only mounts once the connection has hydrated the Y.Doc from
 * `initial_state` (CLAUDE.md §4) — mounting earlier would bind to an empty doc.
 * It reads the live doc and role from the route-scoped Context via the light
 * `useCollaboration` hook; it owns no connection state itself.
 */
export function DocumentWorkspace() {
  const { doc, ready, role } = useCollaboration()

  if (!ready) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Connecting to the document…
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[72ch]">
      <DocumentEditor doc={doc} editable={role !== 'viewer'} />
    </div>
  )
}
