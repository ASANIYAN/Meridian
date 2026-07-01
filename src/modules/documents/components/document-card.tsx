import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DocumentSummary } from '@/types/document'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import { RoleBadge } from './role-badge'
import { DocumentCardTitle } from './document-card-title'

/**
 * Document card (FE-DOC-3) — props-only, no data of its own. A stretched-link
 * pattern: the card body is `pointer-events-none` so clicks fall through to the
 * absolute navigation overlay, while the inline rename control opts back in.
 * The overlay is disabled while the title is being edited so an outside click
 * commits the rename instead of navigating.
 */
export function DocumentCard({ document }: { document: DocumentSummary }) {
  const [editing, setEditing] = useState(false)
  const canEdit = document.role === 'author' || document.role === 'editor'

  return (
    <div className="group relative rounded-md border border-border bg-card p-5 transition-shadow duration-150 ease-out hover:shadow-[0_12px_30px_-18px_rgba(15,26,42,0.3)] has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-ring/35">
      <Link
        to={`/documents/${document.id}`}
        aria-label={`Open ${document.title}`}
        className={cn(
          'absolute inset-0 z-0 rounded-md outline-none',
          editing && 'pointer-events-none',
        )}
      />

      <div className="pointer-events-none relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <RoleBadge role={document.role} />
          {document.status === 'inactive' && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Inactive
            </span>
          )}
        </div>
        <DocumentCardTitle
          documentId={document.id}
          title={document.title}
          canEdit={canEdit}
          onEditingChange={setEditing}
        />
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Updated {formatRelativeTime(document.updatedAt)}
        </p>
      </div>
    </div>
  )
}
