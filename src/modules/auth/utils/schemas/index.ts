import { z } from 'zod'
import { emailField, nameField, passwordField } from './fields'

export const loginSchema = z.object({
  email: emailField,
  // Login only checks presence — strength is enforced at signup, and we never
  // hint password rules on the login screen.
  password: z.string().min(1, 'Enter your password'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  email: emailField,
  password: passwordField,
})
export type SignupValues = z.infer<typeof signupSchema>

export const emailRequestSchema = z.object({
  email: emailField,
})
export type EmailRequestValues = z.infer<typeof emailRequestSchema>

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    // confirmPassword is validated locally and stripped before the API call —
    // it is never sent to the backend (CLAUDE.md §7, FE-AUTH-6).
    confirmPassword: z.string().min(1, 'Re-enter your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
