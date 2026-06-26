import { useState } from 'react'
import { Skeleton } from '@/components/custom-components/skeleton'
import type { GrantableRole } from '../types/sharing.types'
import { useMembers } from '../hooks/use-members'
import { useUpdateMemberRole } from '../hooks/use-update-member-role'
import { useRemoveMember } from '../hooks/use-remove-member'
import { AddMemberForm } from './add-member-form'
import { MemberRow } from './member-row'

/** The members tab (FE-SHARE-2/3) — add by email, list members, change roles,
 *  remove. Author-only by where it's mounted. */
export function MembersPanel({ documentId, active }: { documentId: string; active: boolean }) {
  // Only fetch once this tab is actually shown.
  const { data, isLoading, isError, refetch } = useMembers(documentId, active)
  const roleMutation = useUpdateMemberRole(documentId)
  const removeMutation = useRemoveMember(documentId)
  const [removingId, setRemovingId] = useState<string | null>(null)

  function handleRoleChange(userId: string, role: GrantableRole) {
    roleMutation.mutate({ userId, role })
  }

  function handleRemove(userId: string) {
    setRemovingId(userId)
    removeMutation.mutate(userId, { onSettled: () => setRemovingId(null) })
  }

  return (
    <div className="space-y-4">
      <AddMemberForm documentId={documentId} />

      <div className="h-px bg-border" />

      {isLoading ? (
        <div className="space-y-3 py-1">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : isError ? (
        <div className="py-4 text-center">
          <p className="text-[13px] text-muted-foreground">Couldn't load members.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-1 text-[13px] font-medium text-foreground underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {data?.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              canManage={member.role !== 'author'}
              onRoleChange={handleRoleChange}
              onRemove={handleRemove}
              isRemoving={removingId === member.id && removeMutation.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
