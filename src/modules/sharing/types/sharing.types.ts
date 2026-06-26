import type { Role } from '@/types/document'

/** The two roles an author can grant — never `author` (CLAUDE.md §1). */
export type GrantableRole = 'editor' | 'viewer'

/** How a membership was created: a direct invite, or a claimed share link. */
export type MembershipMode = 'invite' | 'link'

/** A document member (GET /documents/:id/members). `id` is the user id — the
 *  path param for role-change and removal (`/members/:userId`). */
export interface Member {
  id: string
  firstName: string
  lastName: string
  role: Role
  membershipMode: MembershipMode
  createdAt: string
}

/** A freshly-created share link (POST /documents/:id/links). There is no GET to
 *  list links, so the UI only ever holds links it created this session. */
export interface ShareLink {
  id: string
  documentId: string
  role: GrantableRole
  token: string
  /** Backend-generated; the source of truth for the link's shape — copy this
   *  directly, never reconstruct from the token (CLAUDE.md §11). */
  url: string
  isSingleUse: boolean
  expiresAt: string
  createdAt: string
  /** Local-only flag set after a successful revoke (the row stays, struck out). */
  revoked?: boolean
}
