import { z } from 'zod'

/**
 * Add-member form (FE-SHARE-3). Mirrors the backend DTO's constraints
 * (`@IsEmail`, role one of editor/viewer) — CLAUDE.md §7. The author is added by
 * email; there is deliberately no all-users autocomplete (that endpoint returns
 * every user in the system — see §11).
 */
export const addMemberSchema = z.object({
  email: z.string().trim().min(1, 'Enter an email').email('Enter a valid email'),
  role: z.enum(['editor', 'viewer']),
})
export type AddMemberValues = z.infer<typeof addMemberSchema>
