import { z } from 'zod'

/** Email — mirrors the backend's @IsEmail (CLAUDE.md §7). */
export const emailField = z.email('Enter a valid email')

/**
 * Password — mirrors the backend's @IsStrongPassword + length rules: 8–32 chars
 * with at least one lowercase, uppercase, number, and symbol. Two independently
 * maintained schemas, same constraints (CLAUDE.md §2/§7).
 */
export const passwordField = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(32, 'Use at most 32 characters')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[0-9]/, 'Add a number')
  .regex(/[^A-Za-z0-9]/, 'Add a symbol')

/** A non-empty name field. */
export const nameField = (label: string) => z.string().trim().min(1, `${label} is required`)
