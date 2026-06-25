import { Link } from 'react-router-dom'
import type { DocumentSummary } from '@/types/document'
import { formatRelativeTime } from '@/lib/format'
import { RoleBadge } from './role-badge'

/**
 * Document card (FE-DOC-3) — props-only, no data of its own. Title in the
 * document's own serif voice; role and updated-time as mono instrument readouts.
 */
export function DocumentCard({ document }: { document: DocumentSummary }) {
  return (
    <Link
      to={`/documents/${document.id}`}
      className="block rounded-md border border-border bg-card p-5 outline-none transition-shadow duration-150 ease-out hover:shadow-[0_12px_30px_-18px_rgba(15,26,42,0.3)] focus-visible:ring-[3px] focus-visible:ring-ring/35"
    >
      <div className="mb-8 flex items-center justify-between">
        <RoleBadge role={document.role} />
        {document.status === 'inactive' && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Inactive
          </span>
        )}
      </div>
      <h2 className="font-display text-[1.25rem] leading-snug text-foreground">{document.title}</h2>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        Updated {formatRelativeTime(document.updatedAt)}
      </p>
    </Link>
  )
}
