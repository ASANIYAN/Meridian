import { z } from 'zod'

/** A document title — shared by create and rename (backend: IsString + IsNotEmpty). */
const titleField = z
  .string()
  .trim()
  .min(1, 'Give it a title')
  .max(120, 'Keep it under 120 characters')

/** Create-document — title only, per the backend's POST /documents contract. */
export const createDocumentSchema = z.object({ title: titleField })
export type CreateDocumentValues = z.infer<typeof createDocumentSchema>

/** Rename — same title rule as create (PATCH /documents/:id, FE-DOC-4). */
export const renameDocumentSchema = z.object({ title: titleField })
export type RenameDocumentValues = z.infer<typeof renameDocumentSchema>
