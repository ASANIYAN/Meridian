import { useCollaboration } from '../hooks/use-collaboration'
import { DocumentEditor } from './document-editor'

interface DocumentWorkspaceProps {
  title?: string
}

/**
 * The editing surface for the open document. Gates on `ready` so the Tiptap
 * editor only mounts once the connection has hydrated the Y.Doc from
 * `initial_state` (CLAUDE.md §4) — mounting earlier would bind to an empty doc.
 * It reads the live doc and role from the route-scoped Context via the light
 * `useCollaboration` hook; it owns no connection state itself.
 */
export function DocumentWorkspace({ title }: DocumentWorkspaceProps) {
  const { doc, ready, role } = useCollaboration()

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/60 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Connecting to the document…
        </p>
      </div>
    )
  }

  return <DocumentEditor doc={doc} title={title} editable={role !== 'viewer'} />
}
