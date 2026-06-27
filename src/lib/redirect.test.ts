import { describe, expect, it } from 'vitest'
import { sanitizeRedirect } from './redirect'

describe('sanitizeRedirect', () => {
  it('allows a same-origin relative path (with query)', () => {
    expect(sanitizeRedirect('/join/abc?token=xyz')).toBe('/join/abc?token=xyz')
    expect(sanitizeRedirect('/documents')).toBe('/documents')
  })

  it('rejects absolute URLs and protocol-relative hosts (open-redirect guard)', () => {
    expect(sanitizeRedirect('https://evil.test')).toBeNull()
    expect(sanitizeRedirect('//evil.test')).toBeNull()
    expect(sanitizeRedirect('javascript:alert(1)')).toBeNull()
  })

  it('rejects empty/missing values', () => {
    expect(sanitizeRedirect(null)).toBeNull()
    expect(sanitizeRedirect(undefined)).toBeNull()
    expect(sanitizeRedirect('')).toBeNull()
  })
})
