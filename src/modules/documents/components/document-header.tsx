import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/custom-components/skeleton'
import { StatusBadge } from '@/components/custom-components/status-badge'
import type { WireDocumentStatus } from '@/types/document'
import { ShareDialog } from '@/modules/sharing/components/share-dialog'
import { useDocument } from '../hooks/use-document'
import { InlineDocumentTitle } from './inline-document-title'
import { DocumentStatusToggle } from './document-status-toggle'
import { DeleteDocumentDialog } from './delete-document-dialog'

const STATUS_LABEL: Record<WireDocumentStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  inactive: 'Inactive',
  deleted: 'Deleted',
}

// Same dot-color logic as the connection indicator, so document status reads as
// part of one status system (moss = healthy/active, brass = in-between, etc.).
const STATUS_COLOR: Record<WireDocumentStatus, string> = {
  draft: 'var(--brass)',
  active: 'var(--presence-moss)',
  inactive: 'var(--slate)',
  deleted: 'var(--presence-coral)',
}

/**
 * The editor route's header (FE-DOC-4/5/6) — back link, the inline-editable
 * title, a status readout, and the author-only status/delete controls. Lives in
 * the documents module (it owns the title/status/delete contracts) and is
 * rendered by the collaboration route, a deliberate cross-module use (CLAUDE.md
 * §6). It reads metadata via GET /documents/:id so it's correct on deep-links.
 */
export function DocumentHeader({ documentId }: { documentId: string }) {
  const { data } = useDocument(documentId)

  const role = data?.role
  const isAuthor = role === 'author'
  const canEdit = role === 'author' || role === 'editor'

  return (
    <div>
      <Link
        to="/documents"
        className="font-mono text-[11px] uppercase tracking-widest text-foreground/70 transition-colors duration-150 ease-out hover:text-foreground"
      >
        ← Back to documents
      </Link>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          {data ? (
            <InlineDocumentTitle documentId={documentId} title={data.title} canEdit={canEdit} />
          ) : (
            <Skeleton className="h-8 w-64 max-w-full" />
          )}
          {data && (
            <StatusBadge
              className="mt-2"
              label={STATUS_LABEL[data.status]}
              color={STATUS_COLOR[data.status]}
            />
          )}
        </div>

        {data && isAuthor && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ShareDialog documentId={documentId} />
            <DocumentStatusToggle documentId={documentId} status={data.status} />
            <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <DeleteDocumentDialog documentId={documentId} title={data.title} />
          </div>
        )}
      </div>
    </div>
  )
}
