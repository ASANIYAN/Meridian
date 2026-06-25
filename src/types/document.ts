/** The three roles a user can hold on a document (CLAUDE.md §1). */
export type Role = 'author' | 'editor' | 'viewer'

/** Document status the author can toggle (FE-DOC-6); draft/deleted live elsewhere. */
export type DocumentStatus = 'active' | 'inactive'

/** A document as it appears in the list — the current user's role rides along. */
export interface DocumentSummary {
  id: string
  title: string
  role: Role
  status: DocumentStatus
  updatedAt: string
}
