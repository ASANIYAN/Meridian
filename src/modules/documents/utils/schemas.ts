import { z } from 'zod'

/** Create-document — title only, per the backend's POST /documents contract. */
export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Give it a title').max(120, 'Keep it under 120 characters'),
})
export type CreateDocumentValues = z.infer<typeof createDocumentSchema>
