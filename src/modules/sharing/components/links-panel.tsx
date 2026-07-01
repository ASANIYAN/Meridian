import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/custom-components/select-field'
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

  const createMutation = useCreateShareLink(documentId)
  const revokeMutation = useRevokeShareLink(documentId)

  function generate() {
    createMutation.mutate(
      { role, isSingleUse: singleUse },
      { onSuccess: (link) => setLinks((prev) => [link, ...prev]) },
    )
  }

  // Returns the promise so the row's ConfirmDialog can await it — staying open
  // (and showing pending) until the server actually confirms the revoke.
  function revoke(token: string) {
    return revokeMutation.mutateAsync(token, {
      onSuccess: () =>
        setLinks((prev) => prev.map((l) => (l.token === token ? { ...l, revoked: true } : l))),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex w-28 shrink-0 flex-col gap-1.5">
          <Label htmlFor="link-role">Role</Label>
          <SelectField
            id="link-role"
            value={role}
            onChange={(e) => setRole(e.target.value as GrantableRole)}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </SelectField>
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
            <ShareLinkRow key={link.id} link={link} onRevoke={revoke} />
          ))}
        </ul>
      )}
    </div>
  )
}
