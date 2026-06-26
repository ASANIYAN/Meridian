/**
 * Decode a JWT payload client-side (no signature verification — the server is the
 * authority). Used to recover the user's id/email after login, since the login
 * response carries only a token (CLAUDE.md §11).
 */
export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64)) as T
  } catch {
    return null
  }
}
