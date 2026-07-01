import { useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/custom-components/error-boundary'
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

  // Contain a render-time crash from malformed content (top-level nodes that
  // aren't blocks → y-tiptap throws `el.toArray is not a function` at mount).
  // Only the editing surface degrades; the connection/presence/status chrome
  // stays alive, and it resets when `doc` changes. Safety net for the initial
  // load — the real fix for malformed content is server-side.
  return (
    <ErrorBoundary
      resetKeys={[doc]}
      onError={(error) =>
        console.error('[meridian] editor failed to render document content', error)
      }
      fallback={<EditorErrorFallback />}
    >
      <DocumentEditor doc={doc} title={title} editable={role !== 'viewer'} />
    </ErrorBoundary>
  )
}

/**
 * Shown when the editor can't render the hydrated document. This is a data-shape
 * problem (malformed content), not a transient/network error — so it offers a
 * way out rather than a retry, which would just re-crash on the same content.
 */
function EditorErrorFallback() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-muted/60 px-6 text-center">
      <div className="space-y-1.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          This document couldn’t be displayed
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Its content is in a format the editor can’t open. This usually needs to be repaired before
          it will load.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/documents')}
        className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
      >
        Back to documents
      </button>
    </div>
  )
}
