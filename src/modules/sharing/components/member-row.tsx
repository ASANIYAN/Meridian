import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { GrantableRole, Member } from '../types/sharing.types'

interface MemberRowProps {
  member: Member
  /** False for the author's own row — the author can't be demoted or removed. */
  canManage: boolean
  onRoleChange: (userId: string, role: GrantableRole) => void
  onRemove: (userId: string) => void
  isRemoving: boolean
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

/** One member in the panel (FE-SHARE-2): identity, role control, remove. The
 *  author's row is read-only; editor/viewer rows get a role select + remove. */
export function MemberRow({ member, canManage, onRoleChange, onRemove, isRemoving }: MemberRowProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted font-mono text-[11px] font-medium text-foreground">
        {initials(member.firstName, member.lastName)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] text-foreground">
          {member.firstName} {member.lastName}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Joined by {member.membershipMode === 'link' ? 'share link' : 'invite'}
        </p>
      </div>

      {canManage ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <label className="sr-only" htmlFor={`role-${member.id}`}>
            Role for {member.firstName} {member.lastName}
          </label>
          <select
            id={`role-${member.id}`}
            value={member.role}
            onChange={(e) => onRoleChange(member.id, e.target.value as GrantableRole)}
            className="rounded-sm border border-border bg-card px-2 py-1 text-[12.5px] text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          {confirming ? (
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onRemove(member.id)}
                disabled={isRemoving}
                className="rounded-sm px-2 py-1 text-[12px] font-medium text-presence-coral outline-none transition-colors duration-150 ease-out hover:bg-presence-coral/10 focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:opacity-50"
              >
                {isRemoving ? 'Removing…' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={isRemoving}
                className="rounded-sm px-2 py-1 text-[12px] text-muted-foreground outline-none transition-colors duration-150 ease-out hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/35"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Remove ${member.firstName} ${member.lastName}`}
              className="rounded-sm px-2 py-1 text-[12px] text-muted-foreground outline-none transition-colors duration-150 ease-out hover:text-presence-coral focus-visible:ring-[3px] focus-visible:ring-ring/35"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <span
          className={cn(
            'shrink-0 rounded-sm bg-brass/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-brass',
          )}
        >
          Author
        </span>
      )}
    </li>
  )
}
