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
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
  // Fail fast, before anything renders — mirrors the backend's ConfigModule.
  throw new Error(
    `Invalid environment configuration. Check your .env against .env.example:\n${issues}`,
  )
}

/**
 * The WS gateway no longer runs on its own port — it rides the API's own
 * origin, so the WS URL is derived from VITE_API_URL rather than configured
 * separately: http(s) becomes ws(s), same host, no explicit port (443/80
 * defaults apply exactly as they do for the API's own scheme).
 */
function toWebSocketUrl(apiUrl: string): string {
  const url = new URL(apiUrl)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.origin
}

/**
 * Validated environment. Every env access in the app goes through this object,
 * never `import.meta.env` directly (FE-SETUP-5).
 */
export const env = {
  ...parsed.data,
  wsUrl: toWebSocketUrl(parsed.data.VITE_API_URL),
}
