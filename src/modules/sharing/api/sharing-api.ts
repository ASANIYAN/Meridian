import { apiClient, unwrap, type ApiEnvelope } from '@/lib/api/client'
import type { GrantableRole, Member, ShareLink } from '../types/sharing.types'

/** GET /documents/:id/members — all members + their role (any role may read). */
export async function getMembers(documentId: string): Promise<Member[]> {
  const res = await apiClient.get<ApiEnvelope<Member[]>>(`/documents/${documentId}/members`)
  return unwrap(res)
}

/**
 * POST /documents/:id/members — add a user by email (FE-SHARE-3). Author-only.
 * 404 if the email matches no user; 409 if they're already a member.
 */
export async function addMember(
  documentId: string,
  email: string,
  role: GrantableRole,
): Promise<Member> {
  const res = await apiClient.post<ApiEnvelope<Member>>(`/documents/${documentId}/members`, {
    email,
    role,
  })
  return unwrap(res)
}

/** PATCH /documents/:id/members/:userId — change a member's role. Author-only. */
export async function updateMemberRole(
  documentId: string,
  userId: string,
  role: GrantableRole,
): Promise<Member> {
  const res = await apiClient.patch<ApiEnvelope<Member>>(
    `/documents/${documentId}/members/${userId}`,
    { role },
  )
  return unwrap(res)
}

/** DELETE /documents/:id/members/:userId — remove a member. Author-only, 204. */
export async function removeMember(documentId: string, userId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}/members/${userId}`)
}

/**
 * POST /documents/:id/links — generate a share link (FE-SHARE-4). Author-only.
 * Returns a ready-made `url` (expires in 7 days; single-use optional).
 */
export async function createShareLink(
  documentId: string,
  body: { role: GrantableRole; isSingleUse: boolean },
): Promise<ShareLink> {
  const res = await apiClient.post<ApiEnvelope<ShareLink>>(`/documents/${documentId}/links`, body)
  return unwrap(res)
}

/** PATCH /documents/:id/links/:token — revoke a link. Author-only. 400 if it was
 *  already revoked. We only need the success signal, so the body is discarded. */
export async function revokeShareLink(documentId: string, token: string): Promise<void> {
  await apiClient.patch(`/documents/${documentId}/links/${token}`)
}
