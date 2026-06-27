import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/custom-components/confirm-dialog'
import type { ShareLink } from '../types/sharing.types'
import { CopyButton } from './copy-button'

interface ShareLinkRowProps {
  link: ShareLink
  onRevoke: (token: string) => Promise<unknown>
}

/** One generated share link (FE-SHARE-4): role, the copyable URL, and revoke. */
export function ShareLinkRow({ link, onRevoke }: ShareLinkRowProps) {
  return (
    <li className="space-y-2 rounded-md border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {link.role}
        </span>
        {link.isSingleUse && (
          <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Single use
          </span>
        )}
        {link.revoked && (
          <span className="rounded-sm bg-presence-coral/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-presence-coral">
            Revoked
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <code
          className={cn(
            'min-w-0 flex-1 truncate rounded-sm bg-muted/60 px-2 py-1 font-mono text-[12px] text-foreground',
            link.revoked && 'text-muted-foreground line-through',
          )}
        >
          {link.url}
        </code>
        {!link.revoked && <CopyButton value={link.url} label="Copy share link" />}
      </div>

      {!link.revoked && (
        <ConfirmDialog
          tone="danger"
          title="Revoke this link?"
          description="Anyone holding it loses access immediately, and the link can't be reactivated. People who already joined keep their access."
          confirmLabel="Revoke link"
          pendingLabel="Revoking…"
          onConfirm={() => onRevoke(link.token)}
          trigger={
            <button
              type="button"
              className="text-[12px] font-medium text-muted-foreground outline-none transition-colors duration-150 ease-out hover:text-presence-coral focus-visible:ring-[3px] focus-visible:ring-ring/35"
            >
              Revoke link
            </button>
          }
        />
      )}
    </li>
  )
}
