import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/api/get-api-error-message'
import { useToastStore } from '@/store/toast-store'
import { updateMemberRole } from '../api/sharing-api'
import type { GrantableRole, Member } from '../types/sharing.types'
import { membersKey } from './use-members'

interface Vars {
  userId: string
  role: GrantableRole
}

/**
 * Change a member's role (FE-SHARE-2) — optimistic, per CLAUDE.md §8 (reversible,
 * low-consequence, the author can flip it straight back). The row updates
 * immediately; a failure rolls the list back and surfaces a toast.
 */
export function useUpdateMemberRole(documentId: string) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const key = membersKey(documentId)

  return useMutation({
    mutationFn: ({ userId, role }: Vars) => updateMemberRole(documentId, userId, role),
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Member[]>(key)
      queryClient.setQueryData<Member[]>(key, (prev) =>
        prev?.map((m) => (m.id === userId ? { ...m, role } : m)),
      )
      return { previous }
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous)
      addToast({ message: getApiErrorMessage(error), variant: 'error' })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
