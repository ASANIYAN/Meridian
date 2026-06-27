import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getApiErrorStatus } from '@/lib/api/get-api-error-message'
import { documentsKey } from '@/modules/documents/hooks/use-documents'
import { claimShareLink } from '../api/join-api'

/** Display copy for a failed claim, keyed by what actually went wrong. */
export function claimErrorCopy(error: unknown): { title: string; body: string } {
  switch (getApiErrorStatus(error)) {
    case 403:
      return {
        title: 'This link is no longer valid',
        body: 'It may have been revoked, expired, or already used. Ask the author for a fresh invite.',
      }
    case 404:
      return {
        title: 'Invite not found',
        body: "This share link doesn't point to a document. Check that you have the full link.",
      }
    default:
      return {
        title: 'Something went wrong',
        body: "We couldn't process this invite. Please try again in a moment.",
      }
  }
}

/**
 * Claim a share link for the signed-in user (FE-SHARE-5). On success — or if they
 * were already a member (409) — we drop them straight into the document, after
 * invalidating the documents list so it shows the newly-joined doc. Other
 * failures (403/404/…) leave the mutation in its error state for the view to read
 * via {@link claimErrorCopy}.
 */
export function useClaimLink(documentId: string, token: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const goToDocument = () => {
    queryClient.invalidateQueries({ queryKey: documentsKey })
    navigate(`/documents/${documentId}`, { replace: true })
  }

  return useMutation({
    mutationFn: () => claimShareLink(documentId, token),
    onSuccess: goToDocument,
    onError: (error) => {
      if (getApiErrorStatus(error) === 409) goToDocument()
    },
  })
}
