import { useQuery } from '@tanstack/react-query'
import { getMembers } from '../api/sharing-api'

/** Query key for a document's member list — a child of its detail key. */
export const membersKey = (documentId: string) => ['documents', documentId, 'members'] as const

/** The member list for the sharing panel (FE-SHARE-2). Any role may read it,
 *  but the panel itself is author-gated at the call site. */
export function useMembers(documentId: string, enabled: boolean) {
  return useQuery({
    queryKey: membersKey(documentId),
    queryFn: () => getMembers(documentId),
    enabled: enabled && documentId !== '',
  })
}
