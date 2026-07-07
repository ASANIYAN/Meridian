import { env } from '@/config/env'

const ATTEMPT_TIMEOUT_MS = 60_000
const RETRY_DELAY_MS = 3_000
const MAX_ATTEMPTS = 3

let warmUpPromise: Promise<void> | null = null

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pingOnce(): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS)
  try {
    const response = await fetch(env.healthUrl, { signal: controller.signal })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Best-effort ping to `/health` to wake a sleeping Render instance before the
 * user's first real request (login/signup) hits a cold start. Fire-and-forget:
 * never throws, never blocks rendering, and is safe to call from multiple
 * places (app boot + login/signup mount) since the in-flight/settled attempt
 * is memoized module-wide.
 */
export function warmUpServer(): Promise<void> {
  if (!warmUpPromise) {
    warmUpPromise = (async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const ok = await pingOnce()
        if (ok) return
        if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS)
      }
      if (import.meta.env.DEV) {
        console.warn('[warm-up-server] failed to reach /health after retries')
      }
    })()
  }
  return warmUpPromise
}
