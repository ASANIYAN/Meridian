/**
 * Sanitize a post-auth redirect target. Only same-origin *relative* paths are
 * allowed — anything with a scheme or protocol-relative `//host` form is
 * rejected, so a crafted `?redirect=` can never bounce a freshly-authenticated
 * user off to another origin (open-redirect guard).
 */
export function sanitizeRedirect(target: string | null | undefined): string | null {
  if (!target) return null
  if (!target.startsWith('/') || target.startsWith('//')) return null
  return target
}
