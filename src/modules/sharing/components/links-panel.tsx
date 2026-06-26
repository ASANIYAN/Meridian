import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { GrantableRole, ShareLink } from '../types/sharing.types'
import { useCreateShareLink } from '../hooks/use-create-share-link'
import { useRevokeShareLink } from '../hooks/use-revoke-share-link'
import { ShareLinkRow } from './share-link-row'

/**
 * The links tab (FE-SHARE-4). Generates tokenized invite links (role + optional
 * single-use, 7-day expiry). The backend has no endpoint to *list* links, so this
 * shows only links created in this session — made explicit in the copy.
 */
export function LinksPanel({ documentId }: { documentId: string }) {
  const [role, setRole] = useState<GrantableRole>('viewer')
  const [singleUse, setSingleUse] = useState(false)
  const [links, setLinks] = useState<ShareLink[]>([])
  const [revokingToken, setRevokingToken] = useState<string | null>(null)

  const createMutation = useCreateShareLink(documentId)
  const revokeMutation = useRevokeShareLink(documentId)

  function generate() {
    createMutation.mutate(
      { role, isSingleUse: singleUse },
      { onSuccess: (link) => setLinks((prev) => [link, ...prev]) },
    )
  }

  function revoke(token: string) {
    setRevokingToken(token)
    revokeMutation.mutate(token, {
      onSuccess: () =>
        setLinks((prev) => prev.map((l) => (l.token === token ? { ...l, revoked: true } : l))),
      onSettled: () => setRevokingToken(null),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <label
            htmlFor="link-role"
            className="text-[13px] font-medium leading-none text-foreground"
          >
            Role
          </label>
          <select
            id="link-role"
            value={role}
            onChange={(e) => setRole(e.target.value as GrantableRole)}
            className="h-11 rounded-md border border-border bg-card px-2.5 text-[13.5px] text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>

        <label className="flex h-11 cursor-pointer items-center gap-2 text-[13px] text-foreground">
          <input
            type="checkbox"
            checked={singleUse}
            onChange={(e) => setSingleUse(e.target.checked)}
            className="size-4 rounded-sm border-border accent-primary"
          />
          Single use
        </label>

        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={createMutation.isPending}
          onClick={generate}
        >
          {createMutation.isPending ? 'Generating…' : 'Generate link'}
        </Button>
      </div>

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Links expire after 7 days. Copy a link as soon as it's generated — only links you create
        right now are shown here.
      </p>

      {links.length > 0 && (
        <ul className="space-y-2">
          {links.map((link) => (
            <ShareLinkRow
              key={link.id}
              link={link}
              onRevoke={revoke}
              isRevoking={revokingToken === link.token && revokeMutation.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
