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

export function getJwtExpiryMs(token: string): number | null {
  const claims = decodeJwt<{ exp?: unknown }>(token)
  return typeof claims?.exp === 'number' ? claims.exp * 1000 : null
}

export function isJwtExpiringSoon(token: string, windowMs = 120_000): boolean {
  const expiry = getJwtExpiryMs(token)
  return expiry != null && expiry - Date.now() <= windowMs
}
