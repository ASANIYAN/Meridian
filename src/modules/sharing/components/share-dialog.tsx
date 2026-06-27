import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MembersPanel } from './members-panel'
import { LinksPanel } from './links-panel'

type Tab = 'members' | 'links'

/**
 * The sharing surface (FE-SHARE-1) — one dialog, two tabs (members + links),
 * merged deliberately (CLAUDE.md §6): both are author-triggered and share one
 * mental model. Rendered only for authors (gated by the caller in the header).
 */
export function ShareDialog({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('members')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>Manage who can access this document and how.</DialogDescription>
        </DialogHeader>

        <div role="tablist" aria-label="Sharing" className="flex gap-1 rounded-md bg-muted p-1">
          {(['members', 'links'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-sm px-3 py-1.5 text-[13px] font-medium capitalize outline-none transition-colors duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-ring/35',
                tab === t
                  ? 'bg-background text-foreground shadow-[0_1px_2px_rgba(15,26,42,0.08)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto overscroll-contain pt-1">
          {tab === 'members' ? (
            <MembersPanel documentId={documentId} active={open && tab === 'members'} />
          ) : (
            <LinksPanel documentId={documentId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
