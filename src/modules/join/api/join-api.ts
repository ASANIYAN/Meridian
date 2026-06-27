import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'

/** The claim response (ClaimShareLinkResponseDataDto) — membership + document. */
export interface ClaimResult {
  membership: {
    id: string
    firstName: string
    lastName: string
    role: 'editor' | 'viewer'
    membershipMode: 'link'
    createdAt: string
  }
  document: {
    id: string
    title: string
    status: string
  }
}

/**
 * POST /documents/:id/links/validate?token=… — claim a share link (FE-SHARE-5).
 * Authenticated (the membership is created for the JWT's user, not anyone named
 * in the body). The real URL is /join/:id?token=, so both halves are in hand:
 * `:id` from the path segment, `token` from the query string.
 *
 * Failures: 403 revoked/expired/already-claimed · 409 already a member ·
 * 404 link not found.
 */
export async function claimShareLink(documentId: string, token: string): Promise<ClaimResult> {
  const res = await apiClient.post<ApiEnvelope<ClaimResult>>(
    `/documents/${documentId}/links/validate`,
    {},
    { params: { token } },
  )
  return unwrap(res)
}
