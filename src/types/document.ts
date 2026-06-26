/** The three roles a user can hold on a document (CLAUDE.md §1). */
export type Role = 'author' | 'editor' | 'viewer'

/** The two states the author's status toggle can set (FE-DOC-6). */
export type DocumentStatus = 'active' | 'inactive'

/**
 * The full status enum as it arrives on the wire — a freshly created document is
 * `draft`, and `deleted` exists too (the list endpoint filters it out, but a
 * detail fetch can still surface either). The toggle only ever *sets* the
 * `DocumentStatus` subset; this wider type is what we *read*.
 */
export type WireDocumentStatus = 'draft' | DocumentStatus | 'deleted'

/** A document as it appears in the list — the current user's role rides along. */
export interface DocumentSummary {
  id: string
  title: string
  role: Role
  status: WireDocumentStatus
  updatedAt: string
}

/** Single-document metadata (GET /documents/:id), powering the editor header. */
export interface DocumentDetail {
  id: string
  title: string
  role: Role
  status: WireDocumentStatus
  updatedAt: string
}
