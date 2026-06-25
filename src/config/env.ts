import { z } from 'zod'

/** A string that parses as a URL (accepts http(s):// and ws(s)://). */
const urlString = z.string().refine(
  (v) => {
    try {
      new URL(v)
      return true
    } catch {
      return false
    }
  },
  { message: 'must be a valid URL' },
)

const envSchema = z.object({
  VITE_API_URL: urlString,
  VITE_WS_URL: urlString,
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n')
  // Fail fast, before anything renders — mirrors the backend's ConfigModule.
  throw new Error(
    `Invalid environment configuration. Check your .env against .env.example:\n${issues}`,
  )
}

/**
 * Validated environment. Every env access in the app goes through this object,
 * never `import.meta.env` directly (FE-SETUP-5).
 */
export const env = parsed.data
