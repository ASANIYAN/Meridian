import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

/**
 * Vitest runs under Node, not a browser, so `new URL('./x', import.meta.url)`
 * in source (e.g. pdf-document.ts's embedded-font registration) resolves to
 * a real `file://` URL rather than a Vite-served asset URL. Node's built-in
 * fetch doesn't support the `file:` scheme, so any code that does
 * `fetch(someFileUrl)` — @react-pdf/renderer's font loader does exactly this
 * — fails under test even though the equivalent browser/worker code path
 * works fine. This teaches global fetch to read `file:` URLs off disk;
 * every other URL scheme is passed through to the real fetch unchanged.
 */
const originalFetch = globalThis.fetch

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

  if (url.startsWith('file://')) {
    const data = await readFile(fileURLToPath(url))
    return new Response(data)
  }

  return originalFetch(input, init)
}) as typeof fetch
